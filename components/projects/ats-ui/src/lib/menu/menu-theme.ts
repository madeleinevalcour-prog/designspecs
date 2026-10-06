import { IconContainerTheme } from '../icon-container/icon-container';

/** Data color → icon-container theme (Figma: job = `jobs`; note, task, neutral = `neutral`). */
export const iconContainerTheme = (color: string): IconContainerTheme =>
  color === 'job' ? 'jobs' : color === 'note' || color === 'neutral' || color === 'task' ? 'neutral' : (color as IconContainerTheme);
