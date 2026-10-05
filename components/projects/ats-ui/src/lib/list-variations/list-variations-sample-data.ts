// Sample record-list data, copied 1:1 from the prototype repo's
// list-variations/DataTable.astro and DataTableCards.astro. Used as the default
// content of ListDataTable / ListDataTableCards so they render like the prototype.

export interface ListDataTableColumn {
  /** Key into each row object. */
  key: string;
  label: string;
  /** Render the value link-styled (hyperlink token, medium weight). */
  link?: boolean;
}
export type ListDataTableRow = Record<string, string>;

export interface ListCardField {
  /** Icon name from the icon set. */
  icon: string;
  text: string;
}
export interface ListCard {
  name: string;
  fields: ListCardField[];
  description: string;
}

export const LIST_SAMPLE_COLUMNS: ListDataTableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Personal Email', link: true },
  { key: 'job', label: 'Job Title' },
  { key: 'id', label: 'ID' },
  { key: 'phone', label: 'Mobile Phone', link: true },
  { key: 'relevancy', label: 'Relevancy' },
  { key: 'city', label: 'Location' },
  { key: 'status', label: 'Status' },
];

const r = (email: string, job: string, id: string, phone: string, city: string): ListDataTableRow => ({
  name: 'table-cell-value', email, job, id, phone, relevancy: 'table-cell-value', city, status: 'table-cell-value',
});

export const LIST_SAMPLE_ROWS: ListDataTableRow[] = [
  r('Sincere_Jones@yahoo.com', 'District Security Director', '12989', '679-274-4162', 'Austin, TX'),
  r('Lydia_Green@gmail.com', 'Project Manager', '12990', '670-189-4235', 'Austin, TX'),
  r('Marcus_Wright@outlook.com', 'Software Engineer', '12991', '658-243-7820', 'Seattle, WA'),
  r('Emma.Taylor@gmail.com', 'UX Designer', '12992', '610-789-5432', 'New York, NY'),
  r('Oliver_Smith@yahoo.com', 'Data Analyst', '12993', '659-123-4567', 'Miami, FL'),
  r('Sophia.Jones@outlook.com', 'Content Strategist', '12994', '678-456-7890', 'San Francisco, CA'),
  r('Jacob_Brown@gmail.com', 'Business Analyst', '12995', '612-345-7891', 'Chicago, IL'),
  r('Ava_Miller@yahoo.com', 'Graphic Designer', '12996', '620-234-5678', 'Los Angeles, CA'),
  r('James_Wilson@outlook.com', 'Web Developer', '12997', '630-124-5678', 'Boston, MA'),
  r('Mia_Davis@gmail.com', 'Marketing Specialist', '12998', '640-789-1234', 'Denver, CO'),
  r('Liam_Johnson@yahoo.com', 'Product Owner', '12999', '650-342-6789', 'Houston, TX'),
  r('Zoe_Martinez@outlook.com', 'QA Engineer', '13000', '661-987-4321', 'Atlanta, GA'),
  r('Henry_Garcia@gmail.com', 'Systems Analyst', '13001', '672-134-7654', 'Phoenix, AZ'),
  r('CharlotteRodriguez@yahoo.com', 'Network Engineer', '13002', '683-456-1234', 'Philadelphia, PA'),
  r('Elijah_Hernandez@outlook.com', 'Sales Executive', '13003', '694-789-5432', 'Detroit, MI'),
  r('Grace_Clark@gmail.com', 'HR Specialist', '13004', '705-123-9876', 'San Diego, CA'),
  r('Mason_Lewis@yahoo.com', 'Financial Analyst', '13005', '716-678-5432', 'Baltimore, MD'),
  r('Evelyn_Young@outlook.com', 'Administrative Assistant', '13006', '727-123-4567', 'Minneapolis, MN'),
  r('Lucas_Allen@gmail.com', 'Research Scientist', '13007', '738-987-6543', 'Salt Lake City, UT'),
];

const SAMPLE_CARD: ListCard = {
  name: 'Tom Mitchell',
  fields: [
    { icon: 'company', text: 'Nexus Dynamics' },
    { icon: 'candidate', text: 'Steve Smith' },
    { icon: 'email', text: 'name@email.com' },
    { icon: 'location', text: 'Boston, MA' },
  ],
  description:
    'Project manager with 5 years of experience leading teams in agile environments. Eager to foster collaboration and drive project success. Interested in remote management roles.',
};

/** 16 cards (the prototype shows two columns of 8). */
export const LIST_SAMPLE_CARDS: ListCard[] = Array.from({ length: 16 }, () => SAMPLE_CARD);
