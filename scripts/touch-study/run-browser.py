#!/usr/bin/env python3
"""Bounded Playwright CLI harness: retain original failure before one safe reload."""
import argparse, json, pathlib, subprocess, sys, time
parser=argparse.ArgumentParser()
parser.add_argument('--session',default='touch-webkit')
parser.add_argument('--width',type=int,default=390)
parser.add_argument('--height',type=int,default=844)
parser.add_argument('--native',action='store_true')
parser.add_argument('--fault',choices=['stale','missing'])
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parents[2]
output=root/'output/playwright/touch-study'
output.mkdir(parents=True,exist_ok=True)
run=str(time.time_ns())
cli=pathlib.Path.home()/'.codex/skills/playwright/scripts/playwright_cli.sh'
records=[]
def call(*cmd):
    proc=subprocess.run([str(cli),f'-s={args.session}',*cmd],cwd=root,text=True,capture_output=True,timeout=50)
    records.append({'command':list(cmd),'stdout':proc.stdout,'stderr':proc.stderr,'returncode':proc.returncode})
    if proc.returncode or '### Error' in proc.stdout: raise RuntimeError('CLI failed: '+cmd[0])
    return proc.stdout
try:
    call('resize',str(args.width),str(args.height))
    call('reload')
    if args.fault:
        code="() => { const original=touchStudy; const frozen=original.observe(); window.touchStudy={...original,observe:()=>"+('null' if args.fault=='missing' else 'frozen')+"}; }"
        call('eval',code)
    result=call('run-code','--filename','scripts/touch-study/native-touch.js' if args.native else 'scripts/touch-study/browser-check.js')
    payload=json.JSONDecoder().raw_decode(result.split('### Result\n',1)[1])[0]
    evidence=output/f'{args.session}-{args.width}-{run}.json'
    evidence.write_text(json.dumps({'result':payload,'commands':records},indent=2))
    if payload['status']=='FAIL':
        # Preserve original diagnostics. Recovery only checks restored health, never upgrades failure to pass.
        if payload.get('classification','uncertain')=='harness-failure':
            try:
                call('reload')
                health=call('eval','() => window.touchStudy?.health()')
                (output/f'recovery-{run}.json').write_text(json.dumps({'health':health,'original':str(evidence)}))
            except Exception as exc:
                (output/f'recovery-{run}.json').write_text(json.dumps({'error':str(exc),'original':str(evidence)}))
        print(json.dumps({'status':'EXPECTED HARNESS FAILURE' if args.fault and payload.get('classification','uncertain')=='harness-failure' else 'FAIL','classification':payload.get('classification','uncertain'),'error':payload['error'],'evidence':str(evidence)}))
        sys.exit(0 if args.fault and payload.get('classification','uncertain')=='harness-failure' else 1)
    if args.fault: raise RuntimeError('Injected harness fault was not detected')
    print(json.dumps({'status':'PASS','assertions':payload.get('assertions',len(payload.get('checks',[]))),'revision':payload['revision'],'viewport':payload.get('viewport',{'width':args.width,'height':args.height}),'evidence':str(evidence)}))
except (Exception,subprocess.TimeoutExpired) as exc:
    evidence=output/f'harness-failure-{run}.json'
    evidence.write_text(json.dumps({'status':'FAIL','classification':'harness-failure','error':str(exc),'commands':records},indent=2))
    print(json.dumps({'status':'FAIL','classification':'harness-failure','error':str(exc),'evidence':str(evidence)}))
    sys.exit(1)
