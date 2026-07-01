/**
 * Seed one realistic example project into Knowledge OS L4 (Project experience),
 * linked to the `china-caviar-to-france` playbook, so /admin/projects and the
 * playbook page show Experience Intelligence with real-looking data.
 *
 * Run once on the server:
 *   npx tsx scripts/seed-example-project.ts
 * Idempotent: skips if a project with the same title already exists.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TITLE = 'Caviar import — Shanghai sturgeon farm → France (example)';

async function main() {
  const existing = await prisma.project.findFirst({ where: { title: TITLE } });
  if (existing) {
    console.log('Example project already exists, skipping:', existing.id);
    return;
  }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  const project = await prisma.project.create({
    data: {
      title: TITLE,
      playbookSlug: 'china-caviar-to-france',
      sector: 'food-import',
      region: 'Île-de-France',
      status: 'COMPLETED',
      startedAt: new Date('2025-09-01'),
      completedAt: new Date('2026-01-15'),
      actualDays: 136,
      actualCostEur: 38000,
      partners: ['Customs broker (Le Havre)', 'CITES consultant', 'Cold-chain 3PL'],
      notes: 'First shipment of farmed sturgeon caviar cleared successfully; CITES + veterinary approval were the long poles.',
      ownerId: admin?.id ?? null,
      steps: {
        create: [
          {
            name: 'Company registration (SAS)',
            status: 'DONE',
            authority: 'INPI — Guichet unique',
            actualDays: 18,
            approvalDays: 12,
          },
          {
            name: 'EORI number & VAT registration',
            status: 'DONE',
            authority: 'Douane (DGDDI) / DGFiP',
            actualDays: 9,
            approvalDays: 6,
          },
          {
            name: 'CITES import permit (sturgeon)',
            status: 'DONE',
            authority: 'DREAL / CITES management authority',
            actualDays: 48,
            approvalDays: 42,
            partner: 'CITES consultant',
            problem: 'First application rejected — sturgeon source code missing',
            solution: "Resubmitted with the farm's aquaculture source code (C) and species declaration",
            lessons: 'Confirm exact species + CITES source code with the farm before applying; it is the long pole.',
          },
          {
            name: 'Veterinary import approval (product of animal origin)',
            status: 'DONE',
            authority: 'DGAL / DD(ec)PP',
            actualDays: 40,
            approvalDays: 35,
            problem: 'Initial farm was not on the EU-approved establishment list for China',
            solution: 'Switched sourcing to an EU-approved sturgeon farm',
            lessons: 'Verify the EU-approval number of the producing establishment first — no approval, no import.',
          },
          {
            name: 'First customs clearance at Border Control Post',
            status: 'DONE',
            authority: 'PCF Le Havre (via TRACES / CHED-P)',
            actualDays: 3,
            approvalDays: 2,
            partner: 'Customs broker (Le Havre)',
          },
          {
            name: 'French labelling & DDPP activity declaration',
            status: 'DONE',
            authority: 'DGCCRF / DDPP',
            actualDays: 14,
            problem: 'Labels lacked French-language mandatory particulars (INCO)',
            solution: 'Reprinted labels with FR name, net weight, allergens, DDM, importer details',
            lessons: 'Prepare INCO-compliant French labels before the goods arrive, not after.',
          },
        ],
      },
    },
    include: { steps: true },
  });

  console.log(`✅ Created example project ${project.id} with ${project.steps.length} steps.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
