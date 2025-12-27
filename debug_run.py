
import sys
import traceback
import os

print(f"PID: {os.getpid()}")
print(f"CWD: {os.getcwd()}")
print(f"Args: {sys.argv}")
print(f"Env INVOKEAI_DEV_RELOAD: {os.environ.get('INVOKEAI_DEV_RELOAD')}")

try:
    print("Importing run_app...")
    from invokeai.app.run_app import run_app
    print("Imported run_app. Calling run_app()...")
    run_app()
    print("run_app() returned.")
except Exception:
    print("Exception caught:")
    traceback.print_exc()
except SystemExit as e:
    print(f"SystemExit caught: {e}")
finally:
    print("Exiting debug_run.py")
