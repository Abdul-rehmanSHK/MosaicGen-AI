import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AI Mosaic Studio database...');

  // 1. Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'abdulrehman.irfan11286@gmail.com' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN', isVerified: true },
    create: {
      name: 'Owner / Studio Admin',
      email: 'abdulrehman.irfan11286@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mosaic.com' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN', isVerified: true },
    create: {
      name: 'Aurelia Vance (Master Architect)',
      email: 'admin@mosaic.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@mosaic.com' },
    update: { passwordHash: userPasswordHash, role: 'CONTENT_EDITOR', isVerified: true },
    create: {
      name: 'Julian Thorne (Content Editor)',
      email: 'user@mosaic.com',
      passwordHash: userPasswordHash,
      role: 'CONTENT_EDITOR',
      isVerified: true,
    },
  });

  console.log('Users created:', { superAdmin: superAdminUser.email, adminUser: adminUser.email, demoUser: demoUser.email });

  // 2. Create Products (10 Real Architectural Mosaic Catalog Products)
  const products = [
    {
      title: 'Amber Dusk Mosaic',
      slug: 'amber-dusk-mosaic',
      category: 'Kitchen Backsplash',
      sampleImageUrl: 'https://mecartworks.com/wp-content/uploads/2025/10/Amber-Dusk-Mosaic.jpg',
      pricePerSqFt: 135.0,
      description: 'A warm kitchen backsplash featuring sunset-inspired mosaic tiles in shades of red, orange, and gold, paired with natural wood accents.',
      specs: JSON.stringify({ material: 'Glass & Ceramic Tesserae', finish: 'Glossy & Textured Blend', origin: 'Artisan Studio', application: 'Backsplash, Accent Walls' })
    },
    {
      title: 'Starfish Pool Mosaic Medallion',
      slug: 'starfish-pool-mosaic-medallion',
      category: 'Pool & Spa Medallion',
      sampleImageUrl: 'https://mecartworks.com/wp-content/uploads/2026/01/Starfish-Pool-Mosaic-Medallion-565x1024.webp',
      pricePerSqFt: 160.0,
      description: 'Luxury marine pool mosaic featuring a circular medallion with shells, starfish, scrollwork, and gold accents on an ocean-blue tile base ideal for villas and resorts.',
      specs: JSON.stringify({ material: 'Pool-Grade Glass & Gold Foil', finish: 'Slip-Resistant Polished', origin: 'Artisan Studio', application: 'Pool Floors, Spa Centers, Luxury Villas' })
    },
    {
      title: 'Grand Calacatta Lobby Medallion',
      slug: 'custom-mosaic-floor-medallion',
      category: 'Marble Floor Medallion',
      sampleImageUrl: 'https://mecartworks.com/wp-content/uploads/2025/12/Medallion-Design-For-Gary-819x1024.webp',
      pricePerSqFt: 185.0,
      description: 'Bespoke grand floor medallion designed for executive estates, featuring Italian Calacatta marble with polished brass leaf accents and dark granite border ring.',
      specs: JSON.stringify({ material: 'Calacatta Marble & Solid Brass', finish: 'Honed & Polished', origin: 'Carrara, Italy', application: 'Grand Foyer, Rotunda, Executive Lobby' })
    },
    {
      title: 'Crimson Mirage Mosaic',
      slug: 'crimson-mirage-mosaic',
      category: 'Feature Accent Wall',
      sampleImageUrl: 'https://mecartworks.com/wp-content/uploads/2025/10/Crimson-Mirage-Mosaic-796x1024.jpg',
      pricePerSqFt: 140.0,
      description: 'A stunning wall mosaic featuring cascading red and beige tones, creating a dramatic wave-like pattern that adds warmth and depth to any modern interior space.',
      specs: JSON.stringify({ material: 'Natural Stone & Smalti Glass', finish: 'Matte & Iridescent', origin: 'Artisan Studio', application: 'Bathroom Niche, Powder Room, Feature Wall' })
    },
    {
      title: 'Custom Mosaic Portrait in Tile',
      slug: 'mosaic-portrait-project',
      category: 'Artistic Mosaic Portrait',
      sampleImageUrl: 'https://mecartworks.ae/wp-content/uploads/2025/06/A-Mosaic-Portrait-1.webp',
      pricePerSqFt: 210.0,
      description: 'An emotional tribute brought to life through mosaic—this handcrafted portrait captures depth, memory, and character in every tile for a truly personal masterpiece.',
      specs: JSON.stringify({ material: 'Hand-cut Micro Tesserae & Gold Glass', finish: 'Fine Art Hand-carved', origin: 'Artisan Atelier', application: 'Private Art Collection, Gallery Wall, Estate Feature' })
    },
    {
      title: 'Bespoke Marble Entrance Medallion',
      slug: 'mosaic-juniper-table-palm-springs',
      category: 'Marble Floor Medallion',
      sampleImageUrl: 'https://mecartworks.com/wp-content/uploads/2025/05/juniper-table-marble-mosaic-entrance-banner.jpg',
      pricePerSqFt: 155.0,
      description: 'Custom bespoke marble entrance threshold mosaic handcrafted from honed Italian marble tesserae with classical architectural borders.',
      specs: JSON.stringify({ material: 'Commercial Marble & Limestone', finish: 'Honed High-Traffic', origin: 'Artisan Studio', application: 'Hotel Entrance, Restaurant Threshold, Retail Lobby' })
    },
    {
      title: 'Emerald Wildlife Mosaic Wall',
      slug: 'emerald-wildlife-mosaic-wall',
      category: 'Tropical Wall Mural',
      sampleImageUrl: 'https://mecartworks.com/wp-content/uploads/2026/02/Emerald-Wildlife-Mosaic-Wall-1-1024x1024.webp',
      pricePerSqFt: 175.0,
      description: 'Emerald Canopy Wildlife Mosaic is a UV-stable, non-porous tropical mural with flamingo and palm motifs ideal for luxury pool walls and spa spaces.',
      specs: JSON.stringify({ material: 'UV-Stable Smalti & Glass', finish: 'Non-Porous Moisture-Proof', origin: 'Artisan Studio', application: 'Indoor Pool, Steam Room, Solarium Feature Wall' })
    },
    {
      title: 'Riad Moroccan Zellige Tile Wall',
      slug: 'riad-moroccan-zellige-tile-wall',
      category: 'Moroccan Zellige Wall',
      sampleImageUrl: 'https://mecartworks.com/wp-content/uploads/2019/09/x1.-RIAD-.jpg',
      pricePerSqFt: 125.0,
      description: 'Riad Zellige Tile: Moroccan geometric star and cross patterns in teal and black. Textured handmade finish delivering rich cultural elegance.',
      specs: JSON.stringify({ material: 'Handmade Glazed Terracotta', finish: 'Traditional Chiseled Enamel', origin: 'Fez, Morocco & Atelier', application: 'Courtyard Wall, Kitchen Splash, Bath Enclosure' })
    },
    {
      title: 'Baroque Symphony Mosaic Floor',
      slug: 'baroque-symphony-mosaic-floor',
      category: 'Grand Floor Medallion',
      sampleImageUrl: 'https://mecartworks.ae/wp-content/uploads/2025/06/Baroque-Symphony-Mosaic-Floor.jpg',
      pricePerSqFt: 190.0,
      description: 'Elegant mosaic floor with intricate golden and bronze patterns, creating a warm, luxurious ambiance perfect for grand interiors or sophisticated living spaces.',
      specs: JSON.stringify({ material: 'Imperial Gold Marble & Bronze Inlay', finish: 'High Polish Mirror Finish', origin: 'Artisan Atelier', application: 'Palace Ballroom, Grand Rotunda, Dining Salon' })
    },
    {
      title: 'Botanical Foliage Mosaic Mural',
      slug: 'custom-tropical-mosaic-wall-murals',
      category: 'Handcrafted Wall Mural',
      sampleImageUrl: 'https://mecartworks.ae/wp-content/uploads/2026/02/Mosaic-Wall-Art-Tropical-theme-1024x737.webp',
      pricePerSqFt: 165.0,
      description: 'Handcrafted bespoke mosaic murals combining tropical botanical foliage designs and fine Italian vitreous glass craftsmanship.',
      specs: JSON.stringify({ material: 'Vitreous Glass & Marble Chips', finish: 'Semi-Gloss Hand-Set', origin: 'Artisan Atelier', application: 'Master Suite Headboard, Dining Room, Conservatory' })
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



  // 4. Create Initial AI Generations & Leads
  const sampleProduct = await prisma.product.findFirst({ where: { slug: 'calacatta-celestial-medallion' } });
  
  if (sampleProduct) {
    const generation = await prisma.aIGeneration.create({
      data: {
        userId: demoUser.id,
        userEmail: demoUser.email,
        prompt: 'Luxury grand rotunda entryway with radiant Calacatta gold sunburst medallion and dark polished border tiles.',
        placement: 'Floor Medallion',
        resultImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        productId: sampleProduct.id,
      }
    });

    await prisma.lead.create({
      data: {
        userId: demoUser.id,
        productId: sampleProduct.id,
        generationId: generation.id,
        name: 'Julian Thorne',
        email: 'julian@thorne-architects.com',
        message: 'Requesting sample chip box and 64 sq.ft quote for a penthouse foyer project in New York.',
        status: 'NEW',
        spaceType: 'Entryway',
        roomDimensions: '64 sq.ft',
        assignedToId: adminUser.id,
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
