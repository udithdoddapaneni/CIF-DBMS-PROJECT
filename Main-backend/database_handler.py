import sqlalchemy
#Database Utility Class
from sqlalchemy.engine import create_engine
# Provides executable SQL expression construct
from sqlalchemy.sql import text
sqlalchemy.__version__

class PostgresqlDB:
    def __init__(self,user_name,password,host,port,db_name):
        """
        class to implement DDL, DQL and DML commands,
        user_name:- username
        password:- password of the user
        host
        port:- port number
        db_name:- database name
        """
        self.user_name = user_name
        self.password = password
        self.host = host
        self.port = port
        self.db_name = db_name
        self.engine = self.create_db_engine()
        # testing
        self.execute_dql_commands("select current_user")

    def create_db_engine(self):
        """
        Method to establish a connection to the database, will return an instance of Engine
        which can used to communicate with the database
        """
        try:
            db_uri = f"postgresql+psycopg2://{self.user_name}:{self.password}@{self.host}:{self.port}/{self.db_name}"
            return create_engine(db_uri)
        except Exception as err:
            raise RuntimeError(f'Failed to establish connection -- {err}') from err

    def execute_dql_commands(self,stmnt,values=None):
        """
        DQL - Data Query Language
        SQLAlchemy execute query by default as

        BEGIN
        ....
        ROLLBACK

        BEGIN will be added implicitly everytime but if we don't mention commit or rollback explicitly
        then rollback will be appended at the end.
        We can execute only retrieval query with above transaction block.If we try to insert or update data
        it will be rolled back.That's why it is necessary to use commit when we are executing
        Data Manipulation Langiage(DML) or Data Definition Language(DDL) Query.
        """
        try:
            with self.engine.connect() as conn:
                if values is not None:
                    result = conn.execute(text(stmnt),values)
                else:
                    result = conn.execute(text(stmnt))
            return result
        except Exception as err:
            print(f'Failed to execute dql commands -- {err}')
            raise RuntimeError

    def execute_ddl_and_dml_commands(self,stmnt,values=None):
        """
        Method to execute DDL and DML commands
        here we have followed another approach without using the "with" clause
        """
        connection = self.engine.connect()
        trans = connection.begin()
        try:
            if values is not None:

                result = connection.execute(text(stmnt),values)
            else:
                result = connection.execute(text(stmnt))
            trans.commit()
            connection.close()
            print('Command executed successfully.')
        except Exception as err:
            trans.rollback()
            print(f'Failed to execute ddl and dml commands -- {err}')
            raise RuntimeError

#Defining Db Credentials
def login(username, password) -> PostgresqlDB:
    USER_NAME = username
    PASSWORD = password
    PORT = 5432
    DATABASE_NAME = 'CIF'
    HOST = 'localhost'

    #Note - Database should be created before executing below operation
    #Initializing SqlAlchemy Postgresql Db Instance
    db = PostgresqlDB(user_name=USER_NAME,
                        password=PASSWORD,
                        host=HOST,port=PORT,
                        db_name=DATABASE_NAME)
    engine = db.engine

    return db



def show_all_students(db: PostgresqlDB):
    fields = ["student_id", "student_name", "super_visor_id"]
    r = list(db.execute_dql_commands("select * from student"))
    result = []
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def show_all_faculty(db: PostgresqlDB):
    fields = ["faculty_id", "faculty_name"]
    r = list(db.execute_dql_commands("select * from faculty"))
    result = []
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def show_all_staff(db: PostgresqlDB):
    fields = ["staff_id", "staff_name"]
    r = list(db.execute_dql_commands("select * from staff"))
    result = []
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def show_all_equipment(db: PostgresqlDB):
    fields = ["equipment_name"]
    r = list(db.execute_dql_commands("select distinct equipment_name from equipment"))
    result = []
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def show_avaiable_slots_for_equipment(db: PostgresqlDB, equipment_name: str):
    query = f"select s.slot_id, equipment.equipment_name, s.equipment_id, s.slot_time from equipment, check_slots() as s where s.equipment_id = equipment.equipment_id and equipment.equipment_name = '{equipment_name}'"
    r = list(db.execute_dql_commands(query))
    result = []
    fields = ["slot_id", "equipment_name", "equipment_id", "slot_time"]
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def request_a_slot_for_project(db: PostgresqlDB, slot_id: int, project_id: str):
    query = f"call request_slot({slot_id}, '{project_id}')"
    db.execute_ddl_and_dml_commands(query)

def decide_by_super_visor(db: PostgresqlDB, request_id: int, decision: str):
    query = f"call decide_by_super_visor({request_id}, '{decision}')"
    db.execute_ddl_and_dml_commands(query)

def decide_by_faculty_incharge(db: PostgresqlDB, request_id: int, decision: str):
    query = f"call decide_by_faculty_incharge({request_id}, '{decision}')"
    db.execute_ddl_and_dml_commands(query)

def decide_by_staff_incharge(db: PostgresqlDB, request_id: int, decision: str):
    query = f"call decide_by_staff_incharge({request_id}, '{decision}')"
    db.execute_ddl_and_dml_commands(query)

def show_requests_supervisor(db: PostgresqlDB):
    query = "select * from show_requests_supervisor()"
    r = list(db.execute_dql_commands(query))
    result = []
    fields = ["request_id", "equipment_name", "slot_time", "slot_id"]
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def show_requests_faculty_incharge(db: PostgresqlDB):
    query = "select * from show_requests_faculty_incharge()"
    r = list(db.execute_dql_commands(query))
    result = []
    fields = ["request_id", "equipment_name", "slot_time", "slot_id"]
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def show_requests_staff_incharge(db: PostgresqlDB):
    query = "select * from show_requests_staff_incharge()"
    r = list(db.execute_dql_commands(query))
    result = []
    fields = ["request_id", "equipment_name", "slot_time", "slot_id"]
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def is_member_of(db: PostgresqlDB):
    user = list(db.execute_dql_commands("select current_user"))[0][0]
    group = "students"
    query = f"select is_member_of('{user}', '{group}')"
    result = list(db.execute_dql_commands(query))[0][0]
    if result:
        return group
    
    group = "faculty"
    query = f"select is_member_of('{user}', '{group}')"
    result = list(db.execute_dql_commands(query))[0][0]
    if result:
        return group
    
    group = "staff"
    query = f"select is_member_of('{user}', '{group}')"
    result = list(db.execute_dql_commands(query))[0][0]
    if result:
        return group
    
    return None

def show_requests_student(db: PostgresqlDB):
    user = list(db.execute_dql_commands("select current_user"))[0][0]
    view = "request_"+user
    query = f"select {view}.request_id, {view}.slot_id, slot.equipment_id, {view}.proj_id, slot.slot_time from {view}, slot where slot.slot_id = {view}.slot_id"
    r = list(db.execute_dql_commands(query))
    result = []
    fields = ["request_id", "slot_id", "equipment_id", "proj_id", "slot_time"]
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def check_status(db: PostgresqlDB, request_id: int):
    query = f"select check_status({request_id})"
    r = list(db.execute_dql_commands(query))
    result = []
    fields = ["status"]
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result

def show_projects(db: PostgresqlDB):
    query = f"select p.project_id, p.project_title, p.faculty_incharge_id from project as p, student where p.faculty_incharge_id = student.super_visor_id and student.student_id = current_user"
    r = list(db.execute_dql_commands(query))
    result = []
    fields = ["project_id", "project_title", "supervisor"]
    for i in r:
        record = {}
        for j in range(len(i)):
            record[fields[j]] = i[j]
        result.append(record)
    return result
