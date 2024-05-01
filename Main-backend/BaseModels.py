from pydantic import BaseModel


class LoginCredentials(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    token: str

class Equipment(BaseModel):
    token: str
    name: str

class Slot_Request(BaseModel):
    token: str
    slot_ID: int
    project_ID: str

class Decision(BaseModel):
    token: str
    request_id: int
    decision: str
