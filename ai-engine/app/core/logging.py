import json
import logging
import sys
from datetime import datetime
from typing import Optional

from app.config import LogLevel, settings


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)


def setup_logging(
    logger_name: Optional[str] = None,
    level: Optional[LogLevel] = None,
) -> logging.Logger:
    logger = logging.getLogger(logger_name or "flowai")
    log_level = level or settings.log_level
    logger.setLevel(log_level.value if isinstance(log_level, LogLevel) else log_level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logger.level)
        if settings.debug:
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
        else:
            formatter = JSONFormatter()
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"flowai.{name}")


class LoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        extra = kwargs.get("extra", {})
        for key in ("session_id", "flow_id", "node_id"):
            if key in self.extra:
                extra[key] = self.extra[key]
        kwargs["extra"] = extra
        return msg, kwargs


def create_context_logger(
    base_name: str,
    session_id: Optional[str] = None,
    flow_id: Optional[int] = None,
    node_id: Optional[str] = None,
) -> LoggerAdapter:
    logger = get_logger(base_name)
    extra = {}
    if session_id:
        extra["session_id"] = session_id
    if flow_id is not None:
        extra["flow_id"] = flow_id
    if node_id:
        extra["node_id"] = node_id
    return LoggerAdapter(logger, extra)
