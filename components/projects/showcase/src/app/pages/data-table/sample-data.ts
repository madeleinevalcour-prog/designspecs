import { NovoDataTableColumn } from 'ats-ui';

// Sample data, copied from the prototype repo's /components/data-table showcase.
export const COLUMNS: NovoDataTableColumn[] = [
  { label: 'Name', key: 'name', width: 240 },
  { label: 'Personal Email', key: 'email', width: 240, link: true },
  { label: 'Job Title', key: 'job', width: 240 },
  { label: 'ID', key: 'id' },
  { label: 'Mobile Phone', key: 'phone', width: 176, link: true },
  { label: 'Employment Preference', key: 'pref', width: 264 },
  { label: 'Location', key: 'location', width: 168 },
  { label: 'Status', key: 'status', width: 240 },
];

export const ROWS: Record<string, string>[] = [
  { name: 'Sincere Jones', email: 'Sincere_Jones@yahoo.com', job: 'District Security Director', id: '12989', phone: '679-274-4162', pref: 'Temporary, Permanent, Contract', location: 'Pasadena, CA', status: 'Active' },
  { name: 'Lydia Green', email: 'Lydia_Green@gmail.com', job: 'Project Manager', id: '12990', phone: '670-189-4235', pref: 'Permanent', location: 'Austin, TX', status: 'Placed' },
  { name: 'Marcus Wright', email: 'Marcus_Wright@outlook.com', job: 'Software Engineer', id: '12991', phone: '658-243-7820', pref: 'Contract', location: 'Seattle, WA', status: 'Active' },
  { name: 'Emma Taylor', email: 'Emma.Taylor@gmail.com', job: 'UX Designer', id: '12992', phone: '610-789-5432', pref: 'Permanent, Contract', location: 'New York, NY', status: 'Submitted' },
  { name: 'Oliver Smith', email: 'Oliver_Smith@yahoo.com', job: 'Data Analyst', id: '12993', phone: '659-123-4567', pref: 'Temporary', location: 'Miami, FL', status: 'Active' },
  { name: 'Sophia Jones', email: 'Sophia.Jones@outlook.com', job: 'Content Strategist', id: '12994', phone: '678-456-7890', pref: 'Permanent', location: 'San Francisco, CA', status: 'Interviewing' },
  { name: 'Jacob Brown', email: 'Jacob_Brown@gmail.com', job: 'Business Analyst', id: '12995', phone: '612-345-7891', pref: 'Contract', location: 'Chicago, IL', status: 'Active' },
  { name: 'Ava Miller', email: 'Ava_Miller@yahoo.com', job: 'Graphic Designer', id: '12996', phone: '620-234-5678', pref: 'Temporary, Permanent', location: 'Los Angeles, CA', status: 'Placed' },
];
