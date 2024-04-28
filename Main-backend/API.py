from fastapi import FastAPI, Response, Request
import database_handler



app = FastAPI()

users: dict[str, (str, str)] = {}


# db: database_handler.PostgresqlDB = None

def open_connection(key: str):
    username, password = users[key]
    db = database_handler.login(username, password)
    return db

@app.get("/")
async def root():
    return {"message": "Hello World"}

def authenticate(username: str, password: str):
    global users
    try:
        db = database_handler.login(username, password)
        db = None
        users[username] = (username, password)
        return True
    except:
        return False

@app.post("/login")
async def func(username: str, password: str,response : Response):
    if authenticate(username, password):
        response.set_cookie(key = username, value = "user_session", httponly=True)
        return {"message" : "Cookie is set on the browser"}
    else:
        return {"message" : "Failed"}

@app.get("/logout")
async def func(response: Response, request: Request):
    try:
        session = list(request.cookies)[0]
        if session:
            response.delete_cookie(key=session)
            users.pop(session)
            return {"message": f"Logout successful for session: {session}"}
        else:
            return {"message": "No active session"}
    except:
        return {"message: No active session"}

@app.get("/current_user")
async def show_current_user(request: Request):
    try:
        current_user = list(request.cookies)[0]
        db = open_connection(current_user)
        result = list(db.execute_dql_commands("select current_user"))
        db = None # dereference
        return result[0][0]

    except Exception as err: 
        print("error", err)