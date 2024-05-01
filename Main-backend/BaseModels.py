from pydantic import BaseModel


class LoginCredentials(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    token: str

class Equipment(BaseModel):
    name: str

class Slot_Request(BaseModel):
    ID: str
