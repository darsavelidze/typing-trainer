
from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SECRET_KEY'] = 'your_secret_key'
db = SQLAlchemy(app)


# Главная страница
@app.route('/', methods=['GET'])
def index():
    user = None
    stats = None
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        stats = user.stats if user and user.stats else None
    return render_template('index.html', user=user, stats=stats)

# Логин через форму на главной
@app.route('/login', methods=['POST'])
def login_post():
    username = request.form['username']
    password = request.form['password']
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id
        return redirect(url_for('index'))
    return 'Неверные данные', 401

# Выход
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

# Сохранение статистики (JSON)
from flask import jsonify
@app.route('/save_stats', methods=['POST'])
def save_stats():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'ok': False, 'error': 'not authorized'}), 401
    user = User.query.get(user_id)
    if request.is_json:
        data = request.get_json()
        user.stats = data.get('stats', '')
    else:
        user.stats = request.form.get('stats', '')
    db.session.commit()
    return jsonify({'ok': True})

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    stats = db.Column(db.String(256), default='')

def create_db():
    db.create_all()

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if User.query.filter_by(username=username).first():
            return 'Пользователь уже существует'
        user = User(username=username, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('register.html')


if __name__ == '__main__':
    with app.app_context():
        create_db()
    app.run(debug=True)
