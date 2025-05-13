const { PrismaClient } = require('@prisma/client');
require('dotenv/config');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      name: 'Admin',
      isAdmin: true,
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);

  // Create sample movies
  const movies = [
    {
      title: 'The Shawshank Redemption',
      director: 'Frank Darabont',
      year: 1994,
      poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      rating: 5,
      review: 'A timeless classic about hope and redemption.',
      userId: adminUser.id, // Associate with admin user
    },
    {
      title: 'The Godfather',
      director: 'Francis Ford Coppola',
      year: 1972,
      poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      rating: 5,
      review: 'An offer you can\'t refuse - the definitive gangster film.',
      userId: adminUser.id, // Associate with admin user
    },
    {
      title: 'Pulp Fiction',
      director: 'Quentin Tarantino',
      year: 1994,
      poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      rating: 4,
      review: 'Revolutionary storytelling with unforgettable characters.',
      userId: adminUser.id, // Associate with admin user
    },
  ];

  for (const movie of movies) {
    const createdMovie = await prisma.movie.create({
      data: movie,
    });
    console.log(`Created movie: ${createdMovie.title}`);
  }

  // Create a regular user for testing
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Test User',
      isAdmin: false,
    },
  });

  console.log(`Created regular user: ${regularUser.email}`);

  // Create a sample movie rated by regular user
  await prisma.movie.create({
    data: {
      title: 'Inception',
      director: 'Christopher Nolan',
      year: 2010,
      poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      rating: 4,
      review: 'A mind-bending journey through dreams within dreams.',
      userId: regularUser.id, // Associate with regular user
    }
  });

  console.log(`Database has been seeded.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 