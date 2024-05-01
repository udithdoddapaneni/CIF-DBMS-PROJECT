from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from BaseModels import LoginCredentials, Token, Equipment, Slot_Request, Decision, Simple_Request
from hashlib import sha256
import database_handler

app = FastAPI()


users: dict[str, (str, str)] = {}

# Allow requests from specific origins
origins = [
    "http://127.0.0.1:5500",
]

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Allow specific methods
    allow_headers=["*"],  # Allow all headers
)


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
        return True
    except:
        return False

@app.post("/login")
async def login(credentials: LoginCredentials ,response : Response):
    username, password = credentials.username, credentials.password
    token = sha256(username.encode()).hexdigest()
    if authenticate(username, password):
        users[token] = (username, password)
        return {"message" : "Cookie is set on the browser", "Token": token}
    else:
        return {"message" : "Failed"}

@app.post("/logout")
async def logout(token: Token):
    try:
        # session = list(request.cookies)[0]
        session = token.token
        user = users[session][0]
        if session in users:
            users.pop(session)
            return {"message": f"Logout successful for user: {user}"}
        else:
            return {"message": "No active session"}
    except Exception as err:
        print(err)
        return {"message": "No active session"}

@app.post("/current_user")
async def show_current_user(token: Token):
    try:
        # current_user = list(request.cookies)[0]
        current_user = token.token
        db = open_connection(current_user)
        result = list(db.execute_dql_commands("select current_user"))
        db = None # dereference
        return {"message":result[0][0]}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"NO CURRENT USER"}

@app.post("/is_member_of")
async def is_member_of(token: Token):
    try:
        # current_user = list(request.cookies)[0]
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.is_member_of(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_all_students")
async def show_all_students(token: Token):
    try:
        # current_user = list(request.cookies)[0]
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_all_students(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_all_faculty")
async def show_all_faculty(token: Token):
    try:
        # current_user = list(request.cookies)[0]
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_all_faculty(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_all_staff")
async def show_all_staff(token: Token):
    try:
        # current_user = list(request.cookies)[0]
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_all_staff(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_all_equipments")
async def show_all_equipment(token: Token):
    try:
        # current_user = list(request.cookies)[0]
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_all_equipment(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_available_slots_equipment")
async def show_available_slots_equipment(equipment: Equipment):
    try:
        current_user = equipment.token
        db = open_connection(current_user)
        result = database_handler.show_avaiable_slots_for_equipment(db, equipment.name)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/request_a_slot_for_project")
async def request_a_slot_for_project(request: Slot_Request):
    try:
        current_user = request.token
        db = open_connection(current_user)
        result = database_handler.request_a_slot_for_project(db, request.slot_ID, request.project_ID)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_requests_student")
async def show_requests_student(token: Token):
    try:
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_requests_student(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_requests_supervisor")
async def show_requests_supervisor(token: Token):
    try:
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_requests_supervisor(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_requests_faculty_incharge")
async def show_requests_faculty_incharge(token: Token):
    try:
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_requests_faculty_incharge(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_requests_staff_incharge")
async def show_requests_staff_incharge(token: Token):
    try:
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_requests_staff_incharge(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/decide_by_super_visor")
async def decide_by_super_visor(decision: Decision):
    try:
        current_user = decision.token
        db = open_connection(current_user)
        result = database_handler.decide_by_super_visor(db, decision.request_id, decision.decision)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}

@app.post("/decide_by_faculty_incharge")
async def decide_by_faculty_incharge(decision: Decision):
    try:
        current_user = decision.token
        db = open_connection(current_user)
        result = database_handler.decide_by_faculty_incharge(db, decision.request_id, decision.decision)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/decide_by_staff_incharge")
async def decide_by_staff_incharge(decision: Decision):
    try:
        current_user = decision.token
        db = open_connection(current_user)
        result = database_handler.decide_by_staff_incharge(db, decision.request_id, decision.decision)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/check_status")
async def check_status(request: Simple_Request):
    try:
        current_user = request.token
        db = open_connection(current_user)
        result = database_handler.check_status(db, request.request_id)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
    
@app.post("/show_projects")
async def show_projects(token: Token):
    try:
        current_user = token.token
        db = open_connection(current_user)
        result = database_handler.show_projects(db)
        db = None # dereference
        return {"message":result}
    except Exception as err:
        print("error_show_user", err)
        return {"message":"ERROR"}
