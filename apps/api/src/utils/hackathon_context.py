import contextvars

hackathon_name_ctx = contextvars.ContextVar("hackathon_name", default="")
