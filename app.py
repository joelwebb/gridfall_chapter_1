from flask import Flask, redirect, request, render_template, url_for, session, make_response
from datetime import datetime
from functools import wraps
import uuid

app = Flask(__name__)
app.secret_key = "fdaexeax233272d6b9d74dd3acb43b37a39d8f1abe17"


# Host route for the team building app
import uuid

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == "demo" and password == "Pa$$w@rd123*9!":
            session['username'] = username
            return redirect('/home')
    return render_template('login.html')

@app.route('/home')
def home():
    if 'username' not in session:
        return redirect('/login')
    return render_template('home.html', username=session['username'])

@app.route('/create_new_game')
def create_new_game():
    if 'username' not in session:
        return redirect('/login')
    # Generate a unique game ID
    game_id = str(uuid.uuid4())
    # Here you would typically save the game state
    return redirect(url_for('saved_game', game_id=game_id, username=session['username']))

@app.route('/saved_game')
def saved_game() -> str:
    """Render the saved game page.

    Returns:
        str: Rendered HTML template for saved game.
    """
    return render_template('saved_game.html')

@app.route('/select_saved_game')
def select_saved_game():
    if 'username' not in session:
        return redirect('/login')
    # Mock data - replace with actual database query
    saved_games = [
        {'id': 'abc123', 'date': '2025-05-14', 'level': 1},
        {'id': 'def456', 'date': '2025-05-13', 'level': 3}
    ]
    return render_template('select_saved_game.html', saved_games=saved_games)

@app.route('/')
def index():
    return redirect('/login')


# Routes from the original app
@app.route('/gridfall')
def gridfall_index():
    return render_template("gridfall_templates/index.html")


@app.route('/create_character')
def create_character():
    return render_template("gridfall_templates/create_character.html")


@app.route('/load_game', methods=['GET', 'POST'])
def load_game():
    if request.method == 'POST':
        save_code = request.form.get('saveCode')
        # Here you would process the save code and load the game
        # For now, just redirect to home
        return redirect(url_for('home'))
    return render_template("gridfall_templates/load_game.html")


@app.route('/map')
def map():
    return render_template("gridfall_templates/map.html")


@app.route('/play_game')
def play_game():
    level = request.args.get('level', None)
    return render_template('gridfall_templates/play_game.html', level=level)

@app.route('/new_play_game')
def new_play_game():
    level = request.args.get('level', 'level_1')
    return render_template('gridfall_templates/new_play_game.html', level=level)

@app.route('/mobile_game')
def mobile_game():
    level = request.args.get('level', 'level_1')
    return render_template('gridfall_templates/mobile_game.html', level=level)


@app.route('/team')
def team():
    characters = []  # Assuming characters is defined somewhere or can be empty
    return render_template('gridfall_templates/team.html', characters=characters, active_page='Team', request=request)

@app.route('/lore')
def lore() -> str:
    """Render the game lore and story page.

    Returns:
        str: Rendered HTML template for game lore.
    """
    return render_template("gridfall_templates/lore.html", active_page='Lore', request=request)

@app.route('/equipment')
def equipment() -> str:
    """Render the equipment management page.

    Returns:
        str: Rendered HTML template for equipment management.
    """
    return render_template("gridfall_templates/equipment.html",  active_page='Equipment', request=request)

@app.route('/abilities')
def abilities() -> str:
    """Render the character abilities page.

    Returns:
        str: Rendered HTML template for abilities management.
    """
    return render_template("gridfall_templates/abilities.html", active_page='Abilities', request=request)



@app.route('/settings')
def settings() -> str:
    """Render the game settings page.

    Returns:
        str: Rendered HTML template for game settings.
    """
    return render_template("gridfall_templates/settings.html", active_page='Settings', request=request)

@app.route('/tutorial')
def tutorial() -> str:
    """Render the game tutorial page.

    Returns:
        str: Rendered HTML template for game tutorial.
    """
    return render_template("gridfall_templates/tutorial.html", active_page='Tutorial', request=request)

@app.route('/logout')
def logout():
    """Handle logout and redirect to login page.

    Returns:
        Redirect to login page
    """
    session.clear()
    return redirect(url_for('login'))

@app.route('/shop')
def shop() -> str:
    """Render the shop page.

    Returns:
        str: Rendered HTML template for shop.
    """
    return render_template("gridfall_templates/shop.html", active_page='Shop', request=request)
def shop() -> str:
    """Render the game shop page.

    Returns:
        str: Rendered HTML template for game shop.
    """
    return render_template("gridfall_templates/shop.html", active_page='Shop', request=request)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)