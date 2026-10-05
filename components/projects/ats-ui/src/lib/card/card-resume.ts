import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * CardResume — resume body for the card "resume" variant: name + contact line,
 * then titled sections. Sample content, ported as-is from the prototype repo's
 * `card/CardResume.astro`. Drop it into `<ats-card variant="resume">`.
 *
 *   <ats-card variant="resume" showFooter><ats-card-resume /></ats-card>
 */
@Component({
  selector: 'ats-card-resume',
  template: `
    <div>
      <p class="ats-card-resume__name">Tyler Brooks</p>
      <p class="ats-card-resume__contact">Columbus, OH | tyler.brooks&#64;email.com | (614) 555-0917 | linkedin.com/in/tylerbrooks</p>
    </div>
    <div class="ats-card-resume__section">
      <h4 class="ats-card-resume__heading">Summary</h4>
      <p class="ats-card-resume__body">Recent Computer Science graduate seeking an entry-level cloud/infrastructure role. Hands-on with AWS, CI/CD, and containerized deployments through internships and academic projects.</p>
    </div>
    <div class="ats-card-resume__section">
      <h4 class="ats-card-resume__heading">Work History</h4>
      <p class="ats-card-resume__body"><strong>Cloud Systems Engineer (Intern)</strong> · May 2024 – May 2025 · Grandview Analytics — Columbus, OH</p>
      <ul class="ats-card-resume__list">
        <li>Automated deployment pipelines with GitHub Actions, cutting release time ~40%.</li>
        <li>Provisioned and monitored AWS EC2/S3/CloudWatch for internal services.</li>
        <li>Containerized three legacy apps with Docker for staging parity.</li>
      </ul>
    </div>
    <div class="ats-card-resume__section">
      <h4 class="ats-card-resume__heading">Skills</h4>
      <ul class="ats-card-resume__list">
        <li>AWS (EC2, S3, IAM, CloudWatch), Docker, Terraform</li>
        <li>Python, TypeScript, Bash; CI/CD (GitHub Actions)</li>
      </ul>
    </div>
    <div class="ats-card-resume__section">
      <h4 class="ats-card-resume__heading">Education</h4>
      <p class="ats-card-resume__body">B.S. Computer Science · 2025 · The Ohio State University</p>
    </div>
  `,
  styleUrl: './card-resume.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-card-resume' },
})
export class CardResume {}
