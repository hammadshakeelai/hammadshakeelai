// @vitest-environment jsdom
import React from 'react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import ProjectPreview from './ProjectPreview';
import Desktop,{terminalCommand} from './Desktop';
import {projects,featuredProjects} from '../data/projects';
import snapshot from '../data/github-snapshot.json';
import {useDemo} from '../lib/store';
afterEach(()=>{cleanup();useDemo.getState().stop()});
describe('public project catalog',()=>{
it('represents each public repo exactly once and features ten documented projects',()=>{expect(new Set(projects.map(p=>p.repo)).size).toBe(snapshot.repositories.length);expect(featuredProjects).toHaveLength(10);for(const p of featuredProjects){expect(p.caseStudy?.limitations).toBeTruthy();expect(p.sourceUrl).toMatch(/^https:\/\/github.com\/hammadshakeelai\//)}});
it('preserves forks, reference-only applications and blocked embeddings',()=>{expect(projects.filter(p=>p.category==='Forks')).toHaveLength(snapshot.repositories.filter(p=>p.fork).length);expect(projects.find(p=>p.id==='cli-chatbot')?.embedVerified).toBe(false);expect(projects.find(p=>p.id==='top-10-nlp-algorithms-simulators')?.status).toBe('reference');expect(projects.find(p=>p.id==='repodoctor-deploy')?.status).toBe('landing')});
});
describe('demo lifecycle',()=>{
it('loads nothing until activation and permits only one running application',()=>{const [a,b]=featuredProjects;render(<><ProjectPreview project={a}/><ProjectPreview project={b}/></>);expect(document.querySelectorAll('iframe')).toHaveLength(0);fireEvent.click(screen.getAllByRole('button',{name:'Interact with project'})[0]);expect(document.querySelectorAll('iframe')).toHaveLength(1);expect(screen.getByTitle(`${a.name} interactive demo`)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Interact with project'}));expect(document.querySelectorAll('iframe')).toHaveLength(1);expect(screen.getByTitle(`${b.name} interactive demo`)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Close demo'}));expect(document.querySelectorAll('iframe')).toHaveLength(0)});
it('does not offer framing when the source denies it',()=>{render(<ProjectPreview project={projects.find(p=>p.id==='cli-chatbot')!}/>);expect(screen.queryByRole('button',{name:'Interact with project'})).toBeNull();expect(screen.getByRole('link',{name:'Open live'}).getAttribute('href')).toBe('https://mirage-terminal.vercel.app/')});
it('shows genuine mobile screenshots with working gallery navigation',()=>{render(<ProjectPreview project={projects.find(p=>p.id==='pakimongo')!}/>);const first=screen.getByAltText(/screenshot 1 of/).getAttribute('src');fireEvent.click(screen.getByRole('button',{name:'Next screenshot'}));expect(screen.getByAltText(/screenshot 2 of/).getAttribute('src')).not.toBe(first)});
});
describe('desktop',()=>{
it('opens, minimizes, restores and closes project windows',()=>{render(<Desktop/>);fireEvent.click(screen.getByRole('button',{name:/^ASMBOOK Tools/}));expect(screen.getByRole('region',{name:'ASMBOOK window'})).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Minimize ASMBOOK'}));expect(screen.queryByRole('region',{name:'ASMBOOK window'})).toBeNull();fireEvent.click(screen.getByTitle('ASMBOOK'));const region=screen.getByRole('region',{name:'ASMBOOK window'});fireEvent.click(within(region).getByRole('button',{name:'Close ASMBOOK'}));expect(screen.queryByRole('region',{name:'ASMBOOK window'})).toBeNull()});
it('resolves actual project commands and never treats commands as shell code',()=>{expect(terminalCommand('open ASMBOOK')).toMatchObject({project:{id:'asmbook'}});expect(terminalCommand('open no-such-project')).toContain('No project matched');expect(terminalCommand('rm -rf /')).toContain('Unknown command');expect(terminalCommand('open')).toContain('No project matched')});
});
