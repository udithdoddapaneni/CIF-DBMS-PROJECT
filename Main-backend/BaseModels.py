from pydantic import BaseModel


class LoginCredentials(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    token: str