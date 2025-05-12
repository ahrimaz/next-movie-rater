import { PrismaClient } from '@prisma/client';

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
    },
    {
      title: 'The Godfather',
      director: 'Francis Ford Coppola',
      year: 1972,
      poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      rating: 5,
      review: 'An offer you can\'t refuse - the definitive gangster film.',
    },
    {
      title: 'Pulp Fiction',
      director: 'Quentin Tarantino',
      year: 1994,
      poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      rating: 4,
      review: 'Revolutionary storytelling with unforgettable characters.',
    },
  ];

  for (const movie of movies) {
    const createdMovie = await prisma.movie.create({
      data: movie,
    });
    console.log(`Created movie: ${createdMovie.title}`);
  }

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