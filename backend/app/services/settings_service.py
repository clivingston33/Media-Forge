from __future__ import annotations

from pathlib import Path

from pydantic import ValidationError

from app.models.schemas import SettingsPayload, SettingsPatchPayload
from app.utils.json_storage import load_json_file, write_json_file
from app.utils.paths import state_dir


class SettingsValidationError(ValueError):
    pass


class SettingsService:
    def __init__(self, settings_path: Path | None = None) -> None:
        self._settings_path = settings_path or state_dir() / "settings.json"
        self._settings = self._load()

    def get(self) -> SettingsPayload:
        return self._settings

    def patch(self, payload: SettingsPatchPayload) -> SettingsPayload:
        updates = payload.model_dump(exclude_none=True)
        candidate = self._settings.model_copy(update=updates)
        candidate = self._normalize(candidate)
        self._validate(candidate)
        self._settings = candidate
        write_json_file(self._settings_path, self._settings.model_dump(mode="json"))
        return self._settings

    def _load(self) -> SettingsPayload:
        raw_payload = load_json_file(self._settings_path, default=None)
        if raw_payload is None:
            settings = SettingsPayload()
            write_json_file(self._settings_path, settings.model_dump(mode="json"))
            return settings

        try:
            settings = self._normalize(SettingsPayload.model_validate(raw_payload))
            self._validate(settings)
            return settings
        except (SettingsValidationError, ValidationError):
            settings = SettingsPayload()
            write_json_file(self._settings_path, settings.model_dump(mode="json"))
            return settings

    def _normalize(self, settings: SettingsPayload) -> SettingsPayload:
        normalized_folder = str(Path(settings.output_folder).expanduser())
        return settings.model_copy(update={"output_folder": normalized_folder})

    def _validate(self, settings: SettingsPayload) -> None:
        output_folder = Path(settings.output_folder)
        try:
            output_folder.mkdir(parents=True, exist_ok=True)
            probe = output_folder / ".mediaforge-settings-check.tmp"
            probe.write_text("ok", encoding="utf-8")
            probe.unlink(missing_ok=True)
        except OSError as error:
            raise SettingsValidationError(f"Output folder is not writable: {output_folder}") from error


settings_service = SettingsService()
