import {execFileSync} from 'node:child_process';
const branch='origin/seo/site-architecture-v2';
const git=(...args)=>execFileSync('git',['-c','safe.directory=*',...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
let reason='cannot fetch the latest shared GitHub branch';
try {
 git('fetch','origin','seo/site-architecture-v2');
 reason='this checkout does not contain the latest shared GitHub changes (including Grok edits)';
 git('merge-base','--is-ancestor',branch,'HEAD');
 reason='this checkout has uncommitted or unresolved changes; commit the reviewed source first';
 if(git('status','--porcelain'))throw new Error('dirty source');
 console.log('Release source verified: '+git('rev-parse','HEAD')+'; upstream '+git('rev-parse',branch));
} catch {
 console.error('Release blocked: '+reason+'.');
 process.exitCode=1;
}
