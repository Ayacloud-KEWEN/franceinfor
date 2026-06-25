// Decision-maker & relationship reference data (Modules 8 & 11).
import { seededScore } from '../utils';

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  influence: number;
  buyingIntent: number;
  relationship: number;
}

const RAW: Array<Omit<Contact, 'influence' | 'buyingIntent' | 'relationship'>> = [
  { id: 'c1', name: 'Élise Martin', role: 'CEO', company: 'Capgemini' },
  { id: 'c2', name: 'Julien Bernard', role: 'Procurement Director', company: 'Orange Business' },
  { id: 'c3', name: 'Sophie Dubois', role: 'Innovation Director', company: 'Thales' },
  { id: 'c4', name: 'Marc Lefebvre', role: 'CTO', company: 'Dassault Systèmes' },
  { id: 'c5', name: 'Camille Moreau', role: 'CIO', company: 'L’Oréal' },
  { id: 'c6', name: 'Antoine Rousseau', role: 'Sales Director', company: 'Schneider Electric' },
  { id: 'c7', name: 'Nathalie Girard', role: 'Founder', company: 'Doctolib' },
  { id: 'c8', name: 'Thomas Petit', role: 'Marketing Director', company: 'BlaBlaCar' },
];

export const CONTACTS: Contact[] = RAW.map((r) => ({
  ...r,
  influence: seededScore(r.id + 'inf', 50, 98),
  buyingIntent: seededScore(r.id + 'buy', 35, 92),
  relationship: seededScore(r.id + 'rel', 10, 70),
}));

// Simple ownership/corporate network for the relationship graph demo.
export interface OrgNode {
  name: string;
  type: 'parent' | 'company' | 'subsidiary';
  children?: OrgNode[];
}

export const ORG_TREE: OrgNode = {
  name: 'Holding Group SA',
  type: 'parent',
  children: [
    {
      name: 'Capgemini',
      type: 'company',
      children: [
        { name: 'Capgemini Technology Services', type: 'subsidiary' },
        { name: 'Sogeti France', type: 'subsidiary' },
      ],
    },
    {
      name: 'Altran',
      type: 'company',
      children: [{ name: 'Altran Lab', type: 'subsidiary' }],
    },
  ],
};
