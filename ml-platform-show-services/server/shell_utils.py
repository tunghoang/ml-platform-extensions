import subprocess
def remove_service(name, _type, port):
  cmd = f'/opt/tljh/scripts/remove_service.sh "{name}" "{_type}" "{port}"'
  process_completion = subprocess.run(cmd, shell=True)
  return process_completion.returncode == 0
