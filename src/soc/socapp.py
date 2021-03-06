"""
  Copyright 2017 The Jackson Laboratory
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
"""

from collections import OrderedDict
import flask
import os
import sqlite3

app = flask.Flask(__name__)


def _dictify_row(cursor, row):
    """Turns the given row into a dictionary where the keys are the column names"""
    d = OrderedDict()
    for i, col in enumerate(cursor.description):
        d[col[0]] = row[i]
    return d


def dictify_cursor(cursor):
    """converts all cursor rows into dictionaries where the keys are the column names"""
    return (_dictify_row(cursor, row) for row in cursor)


def get_db_connection():
    d = os.path.dirname(os.path.realpath(__file__))
    dbPath = os.path.join(d, '..', '..', 'soc_data', 'soc_data.db')
    if os.path.exists(dbPath):
        return sqlite3.connect(dbPath)
    else:
        raise Exception(dbPath + ' not found')


@app.route('/study/<curated_study_number>.html')
def study_html(curated_study_number):
    dbCon = get_db_connection()
    c = dbCon.cursor()
    c.execute(
        '''SELECT * FROM studies WHERE curated_study_number=?''',
        (curated_study_number, ),
    )
    study = _dictify_row(c, next(c))
    study_number = study.items()[0][1]

    c.execute(
        '''SELECT * FROM treatments WHERE study_number=? ORDER BY treatment_day''',
        (study_number, ),
    )
    treatments = list(dictify_cursor(c))

    c.execute(
        '''
        SELECT * FROM measurements
        WHERE
            study_number=?
        ORDER BY measurement_day
        ''',
        (study_number, ),
    )
    measurements = list(dictify_cursor(c))

    c.execute(
        '''SELECT * FROM animals WHERE study_number=?''',
        (study_number, )
    )
    animals = list(dictify_cursor(c))

    c.execute(
        '''SELECT g.group_name, g.is_control, g.drug, g.curated_group_name, g.recist, c.color
                FROM groups AS g LEFT JOIN colors AS c
                    ON g.drug = c.drug
                    WHERE
                    study_number=?
        ''',
        (study_number, ),
    )
    group_labels = list(dictify_cursor(c))
    
    return flask.render_template(
        'study.html',
        study=study,
        treatments=treatments,
        measurements=measurements,
        animals=animals,
        group_labels=group_labels,
    )


@app.route('/')
@app.route('/index.html')
def index_html():
    dbCon = get_db_connection()
    c = dbCon.cursor()

    results = c.execute('''SELECT * FROM studies''')

    return flask.render_template('index.html', studies=dictify_cursor(results))


# error handling
@app.errorhandler(404)
def page_not_found(e):
    return flask.render_template("errorhandler.html"), 404


@app.errorhandler(500)
def internal_server_error(e):
    return flask.render_template("errorhandler.html"), 500


@app.errorhandler(403)
def forbidden(e):
    return flask.render_template("errorhandler.html"), 403


@app.errorhandler(410)	
def gone(e):
    return flask.render_template("errorhandler.html"), 410


if __name__ == '__main__':
    app.debug = False
    try:
        app.run(host='0.0.0.0')
    except:
        app.run(host='0.0.0.0', port=5001)
