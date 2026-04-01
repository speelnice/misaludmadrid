// src/components/onboarding/OnboardingWizard.tsx
'use client';
import { useState } from 'react';
import { StepClinic }      from './steps/StepClinic';
import { StepSpecialists } from './steps/StepSpecialists';
import { StepCentros }     from './steps/StepCentros';
import { StepServices }    from './steps/StepServices';
import { StepDone }        from './steps/StepDone';

type Step = 'clinic'|'specialists'|'centros'|'services'|'done';
const STEPS: Step[] = ['clinic','specialists','centros','services','done'];
const VIS:   Step[] = ['clinic','specialists','centros','services'];
const META: Record<Step,{label:string;desc:string}> = {
  clinic:      { label:'Clínica',       desc:'Información general' },
  specialists: { label:'Especialistas', desc:'Tu equipo' },
  centros:     { label:'Centros',       desc:'Ubicaciones' },
  services:    { label:'Servicios',     desc:'Tratamientos' },
  done:        { label:'Listo',         desc:'Completado' },
};

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>('clinic');
  const idx  = STEPS.indexOf(step);
  const next = () => { const n=STEPS[idx+1]; if(n) setStep(n); };
  const back = () => { const p=STEPS[idx-1]; if(p) setStep(p); };

  return (
    <div style={{ display:'flex', minHeight:'100dvh', background:'#171614', fontFamily:'var(--font-body,sans-serif)' }}>
      <aside style={{ width:'260px', flexShrink:0, background:'#1c1b19',
        borderRight:'1px solid #262523', padding:'2rem 1.5rem',
        display:'flex', flexDirection:'column', gap:'2rem' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#01696f"/>
            <path d="M16 8c-1.5 0-2.8.6-3.8 1.5C11.2 10.5 10 12.1 10 16c0 3.9 1.2 5.5 2.2 6.5 1 1 2.3 1.5 3.8 1.5s2.8-.5 3.8-1.5C20.8 21.5 22 19.9 22 16c0-3.9-1.2-5.5-2.2-6.5C18.8 8.5 17.5 8 16 8z" fill="white" opacity="0.9"/>
            <circle cx="16" cy="16" r="3" fill="#01696f"/>
          </svg>
          <span style={{ fontSize:'1.1rem', fontWeight:600, color:'#cdccca' }}>MiSalud</span>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {VIS.map((sv,i) => {
            const done=STEPS.indexOf(sv)<idx, active=sv===step;
            return (
              <div key={sv} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.75rem', fontWeight:700, transition:'all 0.2s',
                  background:done||active?'#01696f':'transparent',
                  border:`2px solid ${done||active?'#01696f':'#393836'}`,
                  color:done||active?'#fff':'#5a5957' }}>
                  {done?'✓':i+1}
                </div>
                <div>
                  <p style={{ fontSize:'0.85rem', margin:0, fontWeight:active?600:400,
                    color:active?'#cdccca':done?'#797876':'#5a5957' }}>{META[sv].label}</p>
                  <p style={{ fontSize:'0.7rem', color:'#5a5957', marginTop:'1px' }}>{META[sv].desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop:'auto', fontSize:'0.72rem', color:'#5a5957', lineHeight:1.5 }}>
          Puedes editar todo desde el panel de administración.
        </p>
      </aside>

      <main style={{ flex:1, overflowY:'auto', display:'flex', alignItems:'flex-start',
        justifyContent:'center', padding:'3rem 2rem' }}>
        <div style={{ width:'100%', maxWidth:'560px' }}>
          {step==='clinic'      && <StepClinic      goNext={next} />}
          {step==='specialists' && <StepSpecialists goNext={next} goBack={back} />}
          {step==='centros'     && <StepCentros     goNext={next} goBack={back} />}
          {step==='services'    && <StepServices    goNext={next} goBack={back} />}
          {step==='done'        && <StepDone />}
        </div>
      </main>
    </div>
  );
}
