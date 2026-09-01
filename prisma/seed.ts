import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AI Mosaic Studio database...');

  // 1. Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mosaic.com' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
    create: {
      name: 'Aurelia Vance (Master Architect)',
      email: 'admin@mosaic.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@mosaic.com' },
    update: { passwordHash: userPasswordHash },
    create: {
      name: 'Julian Thorne',
      email: 'user@mosaic.com',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  });

  console.log('Users created:', { adminUser: adminUser.email, demoUser: demoUser.email });

  // 2. Create Products
  const products = [
    {
      title: 'Calacatta Gold & Brass Celestial Medallion',
      slug: 'calacatta-celestial-medallion',
      description: 'Hand-carved Italian Calacatta Gold marble inlay accented with solid brushed brass foil tesserae, designed for grand entryways and rotundas.',
      category: 'Marble Medallion',
      sampleImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      pricePerSqFt: 145.0,
      specs: JSON.stringify({
        material: 'Calacatta Marble & Solid Brass',
        chipSize: '1/2" x 1/2" Hand-cut',
        finish: 'Polished & Honed Blend',
        groutWidth: '1/16"',
        origin: 'Carrara, Italy'
      })
    },
    {
      title: 'Nero Marquina & Diamond Waterjet Mosaic',
      slug: 'nero-marquina-diamond-waterjet',
      description: 'Deep obsidian Spanish marble with bright white veining, precision waterjet cut in geometric diamond mesh for high-contrast floors and accent walls.',
      category: 'Waterjet Accent',
      sampleImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      pricePerSqFt: 110.0,
      specs: JSON.stringify({
        material: 'Nero Marquina & Thassos White Marble',
        chipSize: 'Waterjet Geometric Lattice',
        finish: 'Honed Matte',
        groutWidth: '1/32"',
        origin: 'Basque, Spain'
      })
    },
    {
      title: 'Byzantine Iridescent Gold Glass Mosaic',
      slug: 'byzantine-iridescent-gold-glass',
      description: 'Smalti glass infused with 24k gold leaf foil, offering luminous reflection for luxury spa backsplashes, steam rooms, and accent walls.',
      category: 'Glass Mosaic',
      sampleImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
      pricePerSqFt: 185.0,
      specs: JSON.stringify({
        material: '24k Gold Sandwich Smalti Glass',
        chipSize: '3/4" x 3/4"',
        finish: 'Iridescent Gloss',
        groutWidth: '1/16"',
        origin: 'Venice, Italy'
      })
    },
    {
      title: 'Emerald Botanica Pool & Wellness Inlay',
      slug: 'emerald-botanica-pool-inlay',
      description: 'Lush green quartz and aventurine glass mosaic with organic floral border micro-tesserae crafted for luxury infinity pools and water walls.',
      category: 'Pool Inlay',
      sampleImageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
      pricePerSqFt: 130.0,
      specs: JSON.stringify({
        material: 'Aventurine Glass & Green Micro-Quartz',
        chipSize: '5/8" Curved Chips',
        finish: 'High Gloss Smooth',
        groutWidth: '1/16" Epoxy Grout',
        origin: 'Ravenna, Italy'
      })
    },
    {
      title: 'Thassos Snow White Floral Waterjet Carpet',
      slug: 'thassos-floral-waterjet-carpet',
      description: 'Pure Greek Thassos marble woven into intricate acanthus leaf carpet patterns with subtle mother-of-pearl shell inlay accents.',
      category: 'Waterjet Accent',
      sampleImageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
      pricePerSqFt: 160.0,
      specs: JSON.stringify({
        material: 'Thassos White Marble & Pearl Shell',
        chipSize: 'Precision Curved Waterjet',
        finish: 'Satin Honed',
        groutWidth: '1/32"',
        origin: 'Thassos, Greece'
      })
    }
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
  }
  console.log(`${products.length} products seeded.`);

  // 3. Create Dynamic CMS Pages
  const pages = [
    {
      title: 'Classic Architectural Mosaic Collection',
      slug: 'classic-collection',
      templateType: 'classic_grid',
      heading: 'Timeless Stone & Mosaic Catalog',
      bodyText: 'Explore our master-curated selection of Italian marble medallions, Byzantine gold glass tesserae, and precision waterjet floor carpets engineered for luxury estates.',
      heroImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      secondaryText: 'Filter by placement, material tier, or custom mosaic tile dimensions.',
    },
    {
      title: 'Grand Rotunda & Medallions Showcase',
      slug: 'grand-medallions',
      templateType: 'hero_showcase',
      heading: 'The Art of the Floor Medallion',
      bodyText: 'Transform entry halls and rotundas into breathtaking architectural centerpieces. Each medallion is individually waterjet cut, hand-assembled in Italy, and digitally test-fitted using AI preview rendering.',
      heroImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80',
      secondaryText: 'Custom radii, bespoke brass inlays, and 3D architectural rendering available upon request.',
    },
    {
      title: 'Bespoke AI Studio Experience',
      slug: 'bespoke-studio-experience',
      templateType: 'split_gallery',
      heading: 'Interactive Surface & Floor Design Studio',
      bodyText: 'Upload your floor plans or room photos and sketch custom mask boundaries. Our neural surface pipeline renders photorealistic mosaic textures live onto your space.',
      heroImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
      secondaryText: 'Get instant material cost breakdowns, chip counts, and sample shipments delivered to your design office.',
    }
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }
  console.log(`${pages.length} CMS Pages seeded.`);

  // 4. Create Initial AI Generations & Inquiries
  const sampleProduct = await prisma.product.findFirst({ where: { slug: 'calacatta-celestial-medallion' } });
  
  if (sampleProduct) {
    const generation = await prisma.aIGeneration.create({
      data: {
        userId: demoUser.id,
        prompt: 'Luxury grand rotunda entryway with radiant Calacatta gold sunburst medallion and dark polished border tiles.',
        placement: 'Floor Medallion',
        resultImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        productId: sampleProduct.id,
      }
    });

    await prisma.inquiry.create({
      data: {
        userId: demoUser.id,
        productId: sampleProduct.id,
        generationId: generation.id,
        name: 'Julian Thorne',
        email: 'julian@thorne-architects.com',
        message: 'Requesting sample chip box and 64 sq.ft quote for a penthouse foyer project in New York.',
        status: 'PENDING'
      }
    });
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
