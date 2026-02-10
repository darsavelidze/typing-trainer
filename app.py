
import json
from flask import jsonify
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

# Страница логина


@app.route('/login', methods=['GET'])
def login():
    return render_template('login.html')

# Логин через форму


@app.route('/login', methods=['POST'])
def login_post():
    username = request.form['username']
    password = request.form['password']
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id
        return redirect(url_for('index'))
    return render_template('login.html', error='Неверные данные')

# Выход


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))


# Сохранение статистики (JSON)


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
            return render_template(
                'register.html',
                error='Пользователь уже существует')
        user = User(
            username=username,
            password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        return redirect(url_for('index'))
    return render_template('register.html')


@app.route('/profile')
def profile():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('index'))
    user = User.query.get(user_id)
    if not user:
        return redirect(url_for('index'))

    stats_rows = []
    total_words = 0
    total_attempts = 0
    avg_time = '—'
    best_speed = '—'

    if user.stats:
        try:
            word_stats = json.loads(user.stats)
            all_avgs = []
            best_w = 0
            for word, data in word_stats.items():
                times = data.get('times', [])
                if not times:
                    continue
                avg = sum(times) / len(times)
                all_avgs.append(avg)
                last_time = times[-1]
                weighted = round(len(word) / last_time, 2) if last_time else 0
                if weighted > best_w:
                    best_w = weighted

                change = ''
                if len(times) > 1:
                    prev = times[-2]
                    curr = times[-1]
                    if curr < prev:
                        change = '<span style="color:green">&#8593;</span>'
                    elif curr > prev:
                        change = '<span style="color:red">&#8595;</span>'
                    else:
                        change = '<span style="color:gray">&#8596;</span>'

                stats_rows.append({
                    'word': word,
                    'avg': f'{avg:.2f}',
                    'count': len(times),
                    'change': change,
                    'weighted': f'{weighted:.2f}',
                })
                total_words += 1
                total_attempts += len(times)

            # Sort by weighted speed descending
            stats_rows.sort(key=lambda r: float(r['weighted']), reverse=True)
            avg_time = f'{(sum(all_avgs) / len(all_avgs)):.2f}' if all_avgs else '—'
            best_speed = f'{best_w:.2f}' if best_w > 0 else '—'
        except (json.JSONDecodeError, TypeError):
            pass

    return render_template('profile.html',
                           user=user,
                           stats_rows=stats_rows,
                           total_words=total_words,
                           total_attempts=total_attempts,
                           avg_time=avg_time,
                           best_speed=best_speed)


if __name__ == '__main__':
    with app.app_context():
        create_db()
    app.run(debug=True)
