import os
from datetime import datetime, date, timedelta
from collections import defaultdict

from flask import Flask, render_template, request, redirect, url_for, flash, abort, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:////workspace/app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', '')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', '587')) if os.environ.get('MAIL_PORT') else None
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

mail = Mail(app)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])


class User(db.Model, UserMixin):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(120), nullable=False)
	email = db.Column(db.String(255), unique=True, nullable=False)
	password_hash = db.Column(db.String(255), nullable=False)
	role = db.Column(db.String(50), default='user')
	allowed_menus = db.Column(db.Text, nullable=True)
	is_active = db.Column(db.Boolean, default=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow)

	def set_password(self, password: str) -> None:
		self.password_hash = generate_password_hash(password)

	def check_password(self, password: str) -> bool:
		return check_password_hash(self.password_hash, password)

	def can_access(self, menu_key: str) -> bool:
		if self.role in ('admin', 'suami'):
			return True
		if not self.allowed_menus:
			return False
		allowed = [m.strip() for m in self.allowed_menus.split(',') if m.strip()]
		return menu_key in set(allowed)


class ExpenseCategory(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(120), nullable=False)
	created_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Expense(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
	category_id = db.Column(db.Integer, db.ForeignKey('expense_category.id'), nullable=True)
	amount_cents = db.Column(db.Integer, nullable=False)
	entry_date = db.Column(db.Date, nullable=False, default=date.today)
	note = db.Column(db.Text, nullable=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow)
	updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

	user = db.relationship('User', backref=db.backref('expenses', lazy=True))
	category = db.relationship('ExpenseCategory', backref=db.backref('expenses', lazy=True))


class Loan(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
	counterparty = db.Column(db.String(255), nullable=False)
	direction = db.Column(db.String(10), nullable=False, default='keluar')
	amount_cents = db.Column(db.Integer, nullable=False)
	entry_date = db.Column(db.Date, nullable=False, default=date.today)
	note = db.Column(db.Text, nullable=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow)
	updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

	user = db.relationship('User', backref=db.backref('loans', lazy=True))


class WeeklyFund(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
	amount_cents = db.Column(db.Integer, nullable=False)
	entry_date = db.Column(db.Date, nullable=False, default=date.today)
	note = db.Column(db.Text, nullable=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow)
	updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

	user = db.relationship('User', backref=db.backref('weekly_funds', lazy=True))


@login_manager.user_loader
def load_user(user_id):
	return db.session.get(User, int(user_id))


def currency_to_cents(amount_str: str) -> int:
	if amount_str is None:
		return 0
	clean = ''.join(ch for ch in amount_str if ch.isdigit())
	if clean == '':
		return 0
	return int(clean)


def cents_to_currency(amount_cents: int) -> str:
	return f"{int(amount_cents or 0):,}".replace(",", ".")


def require_menu(menu_key: str):
	if not current_user.is_authenticated:
		abort(401)
	if not current_user.can_access(menu_key):
		abort(403)


def week_bounds(some_date: date):
	start = some_date - timedelta(days=some_date.weekday())
	end = start + timedelta(days=6)
	return start, end


@app.route('/', methods=['GET'])
@app.route('/login', methods=['GET', 'POST'])
def login():
	if request.method == 'POST':
		email = request.form.get('email', '').strip().lower()
		password = request.form.get('password', '')
		user = User.query.filter_by(email=email).first()
		if user and user.check_password(password):
			if not user.is_active:
				flash('Akun dinonaktifkan.', 'danger')
				return render_template('login.html')
			login_user(user)
			return redirect(url_for('dashboard'))
		flash('Email atau password salah.', 'danger')
	return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
	logout_user()
	return redirect(url_for('login'))


@app.route('/forgot', methods=['GET', 'POST'])
def forgot_password():
	if request.method == 'POST':
		email = request.form.get('email', '').strip().lower()
		user = User.query.filter_by(email=email).first()
		if user:
			token = serializer.dumps({'user_id': user.id})
			reset_url = url_for('reset_password', token=token, _external=True)
			try:
				if app.config.get('MAIL_SERVER'):
					msg = Message('Reset Password', recipients=[user.email])
					msg.body = f"Klik tautan untuk reset password: {reset_url}"
					mail.send(msg)
					flash('Tautan reset password telah dikirim ke email.', 'info')
				else:
					print(f"[DEV] Reset link: {reset_url}")
					flash('Email tidak dikonfigurasi. Tautan reset ditampilkan di log server.', 'warning')
			except Exception as e:
				print('Mail error', e)
				flash('Gagal mengirim email. Coba lagi nanti.', 'danger')
		else:
			flash('Jika email terdaftar, tautan reset akan dikirim.', 'info')
	return render_template('forgot_password.html')


@app.route('/reset/<token>', methods=['GET', 'POST'])
def reset_password(token):
	try:
		data = serializer.loads(token, max_age=3600)
		user = db.session.get(User, data.get('user_id'))
		if not user:
			raise BadSignature('Invalid user')
	except (BadSignature, SignatureExpired):
		flash('Tautan reset tidak valid atau kadaluarsa.', 'danger')
		return redirect(url_for('login'))

	if request.method == 'POST':
		new_password = request.form.get('password', '')
		if len(new_password) < 6:
			flash('Password minimal 6 karakter.', 'danger')
		else:
			user.set_password(new_password)
			db.session.commit()
			flash('Password berhasil diubah. Silakan login.', 'success')
			return redirect(url_for('login'))
	return render_template('reset_password.html')


@app.route('/dashboard')
@login_required
def dashboard():
	latest_expenses = (Expense.query.filter_by(user_id=current_user.id)
		.order_by(Expense.entry_date.desc(), Expense.created_at.desc())
		.limit(5).all())

	start, end = week_bounds(date.today())
	rows = (db.session.query(ExpenseCategory.name, db.func.sum(Expense.amount_cents))
		.join(Expense, Expense.category_id == ExpenseCategory.id)
		.filter(Expense.user_id == current_user.id, Expense.entry_date >= start, Expense.entry_date <= end)
		.group_by(ExpenseCategory.name).all())
	labels = [r[0] or 'Tanpa Kategori' for r in rows]
	values = [int(r[1] or 0) for r in rows]
	return render_template('dashboard.html', latest_expenses=latest_expenses, labels=labels, values=values,
		start=start, end=end)


@app.route('/reports', methods=['GET', 'POST'])
@login_required
def reports():
	require_menu('reports')
	start_str = request.values.get('start')
	end_str = request.values.get('end')
	if start_str and end_str:
		start = datetime.strptime(start_str, '%Y-%m-%d').date()
		end = datetime.strptime(end_str, '%Y-%m-%d').date()
	else:
		start, end = week_bounds(date.today())

	expenses = (Expense.query.filter(Expense.user_id == current_user.id, Expense.entry_date >= start, Expense.entry_date <= end)
		.order_by(Expense.entry_date.asc()).all())

	by_category = defaultdict(int)
	total_expenses = 0
	for e in expenses:
		by_category[e.category.name if e.category else 'Tanpa Kategori'] += e.amount_cents
		total_expenses += e.amount_cents

	weekly_in = (db.session.query(db.func.sum(WeeklyFund.amount_cents))
		.filter(WeeklyFund.user_id == current_user.id, WeeklyFund.entry_date >= start, WeeklyFund.entry_date <= end).scalar() or 0)

	loans = (Loan.query.filter(Loan.user_id == current_user.id, Loan.entry_date >= start, Loan.entry_date <= end).all())
	net_loans = 0
	for l in loans:
		if l.direction == 'masuk':
			net_loans += l.amount_cents
		else:
			net_loans -= l.amount_cents

	sisa_keuangan = weekly_in + net_loans - total_expenses

	labels = list(by_category.keys())
	values = [by_category[k] for k in labels]

	return render_template('reports.html', start=start, end=end, expenses=expenses, labels=labels, values=values,
		total_expenses=total_expenses, weekly_in=weekly_in, net_loans=net_loans, sisa_keuangan=sisa_keuangan,
		cents_to_currency=cents_to_currency)


@app.route('/settings/categories', methods=['GET', 'POST'])
@login_required
def categories():
	require_menu('categories')
	if request.method == 'POST':
		name = request.form.get('name', '').strip()
		if not name:
			flash('Nama kategori wajib diisi.', 'danger')
		else:
			cat = ExpenseCategory(name=name, created_by_user_id=current_user.id)
			db.session.add(cat)
			db.session.commit()
			flash('Kategori ditambahkan.', 'success')
	return render_template('categories.html', categories=ExpenseCategory.query.order_by(ExpenseCategory.name.asc()).all())


@app.route('/settings/categories/<int:cat_id>/delete', methods=['POST'])
@login_required
def delete_category(cat_id):
	require_menu('categories')
	cat = db.session.get(ExpenseCategory, cat_id)
	if not cat:
		abort(404)
	db.session.delete(cat)
	db.session.commit()
	flash('Kategori dihapus.', 'success')
	return redirect(url_for('categories'))


@app.route('/settings/users')
@login_required
def users_management():
	require_menu('users')
	users = User.query.order_by(User.created_at.desc()).all()
	return render_template('users.html', users=users)


@app.route('/settings/users/new', methods=['GET', 'POST'])
@login_required
def user_new():
	require_menu('users')
	if request.method == 'POST':
		name = request.form.get('name', '').strip()
		email = request.form.get('email', '').strip().lower()
		role = request.form.get('role', 'user')
		allowed = request.form.getlist('allowed_menus')
		password = request.form.get('password', '')
		if not name or not email or not password:
			flash('Nama, email, dan password wajib diisi.', 'danger')
		else:
			u = User(name=name, email=email, role=role, allowed_menus=','.join(allowed))
			u.set_password(password)
			db.session.add(u)
			db.session.commit()
			flash('Pengguna ditambahkan.', 'success')
			return redirect(url_for('users_management'))
	return render_template('user_form.html', user=None)


@app.route('/settings/users/<int:user_id>/edit', methods=['GET', 'POST'])
@login_required
def user_edit(user_id):
	require_menu('users')
	u = db.session.get(User, user_id)
	if not u:
		abort(404)
	if request.method == 'POST':
		u.name = request.form.get('name', u.name)
		u.email = request.form.get('email', u.email).lower()
		u.role = request.form.get('role', u.role)
		u.allowed_menus = ','.join(request.form.getlist('allowed_menus'))
		db.session.commit()
		flash('Pengguna diperbarui.', 'success')
		return redirect(url_for('users_management'))
	return render_template('user_form.html', user=u)


@app.route('/settings/users/<int:user_id>/password', methods=['GET', 'POST'])
@login_required
def user_change_password(user_id):
	require_menu('users')
	u = db.session.get(User, user_id)
	if not u:
		abort(404)
	if request.method == 'POST':
		new_password = request.form.get('password', '')
		if len(new_password) < 6:
			flash('Password minimal 6 karakter.', 'danger')
		else:
			u.set_password(new_password)
			db.session.commit()
			flash('Password diperbarui.', 'success')
			return redirect(url_for('users_management'))
	return render_template('change_password.html', user=u)


@app.route('/expenses', methods=['GET', 'POST'])
@login_required
def expenses_list():
	require_menu('expenses')
	if request.method == 'POST':
		amount_cents = currency_to_cents(request.form.get('amount'))
		entry_date_str = request.form.get('entry_date')
		entry_date_val = datetime.strptime(entry_date_str, '%Y-%m-%d').date() if entry_date_str else date.today()
		category_id = request.form.get('category_id') or None
		note = request.form.get('note')
		e = Expense(user_id=current_user.id, amount_cents=amount_cents, entry_date=entry_date_val,
			category_id=int(category_id) if category_id else None, note=note)
		db.session.add(e)
		db.session.commit()
		flash('Pengeluaran ditambahkan.', 'success')
		return redirect(url_for('expenses_list'))

	all_expenses = (Expense.query.filter_by(user_id=current_user.id)
		.order_by(Expense.entry_date.desc(), Expense.created_at.desc()).all())
	cats = ExpenseCategory.query.order_by(ExpenseCategory.name.asc()).all()
	return render_template('expenses_list.html', expenses=all_expenses, categories=cats,
		cents_to_currency=cents_to_currency)


@app.route('/expenses/<int:exp_id>/edit', methods=['POST'])
@login_required
def expense_edit(exp_id):
	require_menu('expenses')
	e = db.session.get(Expense, exp_id)
	if not e or e.user_id != current_user.id:
		abort(404)
	e.amount_cents = currency_to_cents(request.form.get('amount'))
	entry_date_str = request.form.get('entry_date')
	e.entry_date = datetime.strptime(entry_date_str, '%Y-%m-%d').date() if entry_date_str else e.entry_date
	category_id = request.form.get('category_id') or None
	e.category_id = int(category_id) if category_id else None
	e.note = request.form.get('note')
	db.session.commit()
	flash('Pengeluaran diperbarui.', 'success')
	return redirect(url_for('expenses_list'))


@app.route('/expenses/<int:exp_id>/delete', methods=['POST'])
@login_required
def expense_delete(exp_id):
	require_menu('expenses')
	e = db.session.get(Expense, exp_id)
	if not e or e.user_id != current_user.id:
		abort(404)
	db.session.delete(e)
	db.session.commit()
	flash('Pengeluaran dihapus.', 'success')
	return redirect(url_for('expenses_list'))


@app.route('/loans', methods=['GET', 'POST'])
@login_required
def loans_list():
	require_menu('loans')
	if request.method == 'POST':
		amount_cents = currency_to_cents(request.form.get('amount'))
		entry_date_str = request.form.get('entry_date')
		entry_date_val = datetime.strptime(entry_date_str, '%Y-%m-%d').date() if entry_date_str else date.today()
		counterparty = request.form.get('counterparty', '').strip()
		direction = request.form.get('direction', 'keluar')
		note = request.form.get('note')
		l = Loan(user_id=current_user.id, amount_cents=amount_cents, entry_date=entry_date_val,
			counterparty=counterparty, direction=direction, note=note)
		db.session.add(l)
		db.session.commit()
		flash('Data pinjaman ditambahkan.', 'success')
		return redirect(url_for('loans_list'))

	all_loans = (Loan.query.filter_by(user_id=current_user.id)
		.order_by(Loan.entry_date.desc(), Loan.created_at.desc()).all())
	return render_template('loans_list.html', loans=all_loans, cents_to_currency=cents_to_currency)


@app.route('/loans/<int:loan_id>/edit', methods=['POST'])
@login_required
def loan_edit(loan_id):
	require_menu('loans')
	l = db.session.get(Loan, loan_id)
	if not l or l.user_id != current_user.id:
		abort(404)
	l.amount_cents = currency_to_cents(request.form.get('amount'))
	entry_date_str = request.form.get('entry_date')
	l.entry_date = datetime.strptime(entry_date_str, '%Y-%m-%d').date() if entry_date_str else l.entry_date
	l.counterparty = request.form.get('counterparty', l.counterparty).strip()
	l.direction = request.form.get('direction', l.direction)
	l.note = request.form.get('note')
	db.session.commit()
	flash('Data pinjaman diperbarui.', 'success')
	return redirect(url_for('loans_list'))


@app.route('/loans/<int:loan_id>/delete', methods=['POST'])
@login_required
def loan_delete(loan_id):
	require_menu('loans')
	l = db.session.get(Loan, loan_id)
	if not l or l.user_id != current_user.id:
		abort(404)
	db.session.delete(l)
	db.session.commit()
	flash('Data pinjaman dihapus.', 'success')
	return redirect(url_for('loans_list'))


@app.route('/incomes', methods=['GET', 'POST'])
@login_required
def incomes_list():
	require_menu('incomes')
	if request.method == 'POST':
		amount_cents = currency_to_cents(request.form.get('amount'))
		entry_date_str = request.form.get('entry_date')
		entry_date_val = datetime.strptime(entry_date_str, '%Y-%m-%d').date() if entry_date_str else date.today()
		note = request.form.get('note')
		w = WeeklyFund(user_id=current_user.id, amount_cents=amount_cents, entry_date=entry_date_val, note=note)
		db.session.add(w)
		db.session.commit()
		flash('Uang mingguan ditambahkan.', 'success')
		return redirect(url_for('incomes_list'))

	all_incomes = (WeeklyFund.query.filter_by(user_id=current_user.id)
		.order_by(WeeklyFund.entry_date.desc(), WeeklyFund.created_at.desc()).all())
	return render_template('incomes_list.html', incomes=all_incomes, cents_to_currency=cents_to_currency)


@app.route('/incomes/<int:inc_id>/edit', methods=['POST'])
@login_required
def income_edit(inc_id):
	require_menu('incomes')
	w = db.session.get(WeeklyFund, inc_id)
	if not w or w.user_id != current_user.id:
		abort(404)
	w.amount_cents = currency_to_cents(request.form.get('amount'))
	entry_date_str = request.form.get('entry_date')
	w.entry_date = datetime.strptime(entry_date_str, '%Y-%m-%d').date() if entry_date_str else w.entry_date
	w.note = request.form.get('note')
	db.session.commit()
	flash('Uang mingguan diperbarui.', 'success')
	return redirect(url_for('incomes_list'))


@app.route('/incomes/<int:inc_id>/delete', methods=['POST'])
@login_required
def income_delete(inc_id):
	require_menu('incomes')
	w = db.session.get(WeeklyFund, inc_id)
	if not w or w.user_id != current_user.id:
		abort(404)
	db.session.delete(w)
	db.session.commit()
	flash('Uang mingguan dihapus.', 'success')
	return redirect(url_for('incomes_list'))


@app.route('/api/sisa')
@login_required
def api_sisa():
	start, end = week_bounds(date.today())
	weekly_in = (db.session.query(db.func.sum(WeeklyFund.amount_cents))
		.filter(WeeklyFund.user_id == current_user.id, WeeklyFund.entry_date >= start, WeeklyFund.entry_date <= end).scalar() or 0)
	expenses = (db.session.query(db.func.sum(Expense.amount_cents))
		.filter(Expense.user_id == current_user.id, Expense.entry_date >= start, Expense.entry_date <= end).scalar() or 0)
	loans_out = (db.session.query(db.func.sum(Loan.amount_cents)).filter(Loan.user_id == current_user.id, Loan.direction == 'keluar', Loan.entry_date >= start, Loan.entry_date <= end).scalar() or 0)
	loans_in = (db.session.query(db.func.sum(Loan.amount_cents)).filter(Loan.user_id == current_user.id, Loan.direction == 'masuk', Loan.entry_date >= start, Loan.entry_date <= end).scalar() or 0)
	sisa = weekly_in + loans_in - loans_out - (expenses or 0)
	return jsonify({
		'start': start.isoformat(),
		'end': end.isoformat(),
		'sisa_cents': sisa,
		'sisa_display': cents_to_currency(sisa)
	})


@app.cli.command('init-db')
def init_db():
	db.create_all()
	if not User.query.filter_by(email='suami@example.com').first():
		suami = User(name='Suami', email='suami@example.com', role='suami', allowed_menus='')
		suami.set_password('password')
		db.session.add(suami)
	if not User.query.filter_by(email='istri@example.com').first():
		istri = User(name='Istri', email='istri@example.com', role='user', allowed_menus='dashboard,expenses,loans,incomes,reports')
		istri.set_password('password')
		db.session.add(istri)
	if ExpenseCategory.query.count() == 0:
		for name in ['Kebutuhan Rumah', 'Transportasi', 'Makanan', 'Kesehatan', 'Hiburan']:
			db.session.add(ExpenseCategory(name=name))
	db.session.commit()
	print('Database initialized. Default users: suami@example.com / password, istri@example.com / password')


@app.template_filter('currency')
def currency_filter(cents):
	return cents_to_currency(int(cents or 0))


@app.context_processor
def inject_globals():
	def menu_allowed(key):
		return current_user.is_authenticated and current_user.can_access(key)
	return dict(menu_allowed=menu_allowed)


if __name__ == '__main__':
	with app.app_context():
		db.create_all()
	app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)