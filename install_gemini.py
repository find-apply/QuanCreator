import sys
from pathlib import Path
from invokeai.app.services.config.config_default import get_config
from invokeai.app.services.model_install.model_install_default import ModelInstallService
from invokeai.app.services.download.download_default import DownloadQueueService
from invokeai.app.services.model_records.model_records_sql import ModelRecordServiceSQL
from invokeai.app.services.shared.sqlite.sqlite_util import init_db
from invokeai.app.services.events.events_base import EventServiceBase
from invokeai.backend.util.logging import InvokeAILogger
from invokeai.app.services.image_files.image_files_disk import DiskImageFileStorage

def main():
    config = get_config()
    logger = InvokeAILogger.get_logger(config=config)
    
    # Initialize image storage (needed for DB migrations)
    image_files = DiskImageFileStorage(config.outputs_path)
    
    # Initialize DB and Record Store
    db = init_db(config, logger, image_files=image_files)
    record_store = ModelRecordServiceSQL(db, logger)
    
    # Initialize Event Bus (optional but good practice)
    event_bus = EventServiceBase()

    # Initialize Download Queue
    download_queue = DownloadQueueService(event_bus=event_bus)
    
    # Initialize Installer
    installer = ModelInstallService(
        app_config=config,
        record_store=record_store,
        download_queue=download_queue,
        event_bus=event_bus
    )
    
    installer.start()
    
    try:
        print("Installing Gemini 2.5 Flash...")
        # Use heuristic_import which now supports our API model source
        job = installer.heuristic_import("invokeai/gemini-2-5-flash")
        
        print(f"Job started: {job.id}")
        installer.wait_for_job(job)
        
        if job.errored:
            print(f"Installation failed: {job.error}")
            if job.error_traceback:
                print(job.error_traceback)
            sys.exit(1)
        else:
            print("Installation successful!")
            print(f"Model installed with key: {job.config_out.key}")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        installer.stop()

if __name__ == "__main__":
    main()
