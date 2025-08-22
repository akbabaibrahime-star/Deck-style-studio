
import type { User, Product, ChatMessage } from '../types.ts';

export const users: User[] = [
  {
    id: 'user1',
    username: 'AtelierAura',
    avatarUrl: 'https://picsum.photos/seed/user1/200',
    bio: 'Timeless elegance, ethically crafted. Slow fashion from Paris.',
    decks: [
      { id: 'deck1', name: 'La Parisienne', mediaUrls: ['https://picsum.photos/seed/deck1/400', 'https://picsum.photos/seed/deck1-2/400'], productCount: 2, productIds: ['prod1', 'prod2'] },
      { id: 'deck2', name: 'Autumn Hues', mediaUrls: ['https://picsum.photos/seed/deck2/400'], productCount: 1, productIds: ['prod1'] },
    ],
    contact: { email: 'contact@atelieraura.com', phone: '555-0101' },
    address: { street: 'Rue de la Paix', city: 'Paris', country: 'France' }
  },
  {
    id: 'user2',
    username: 'UrbanTread',
    avatarUrl: 'https://picsum.photos/seed/user2/200',
    bio: 'High-performance streetwear. Engineered for the city.',
    decks: [
        { id: 'deck3', name: 'Techwear Essentials', mediaUrls: ['https://picsum.photos/seed/deck3/400', 'https://picsum.photos/seed/deck3-2/400'], productCount: 2, productIds: ['prod3', 'prod4'] },
    ],
    contact: { email: 'info@urbantread.io', phone: '555-0102' },
    address: { street: 'Shibuya Crossing', city: 'Tokyo', country: 'Japan' }
  },
  {
    id: 'user3',
    username: 'NomadLinen',
    avatarUrl: 'https://picsum.photos/seed/user3/200',
    bio: 'Breathable, beautiful linen for the modern wanderer.',
    decks: [
        { id: 'deck4', name: 'Coastal Living', mediaUrls: ['https://picsum.photos/seed/deck4/400'], productCount: 1, productIds: ['prod5'] },
    ],
    contact: { email: 'hello@nomadlinen.co', phone: '555-0103' },
    address: { street: 'Byron Bay', city: 'NSW', country: 'Australia' }
  }
];

export const products: Product[] = [
  {
    id: 'prod1',
    name: 'The Marais Trench',
    price: 420.00,
    description: 'A classic, double-breasted trench coat made from water-resistant cotton gabardine. Your perfect companion for unpredictable weather, offering both style and function.',
    fabric: {
        name: 'Cotton Gabardine',
        description: 'A tightly woven, durable, and water-resistant fabric invented by Thomas Burberry. It has a smooth finish and excellent drape.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric1/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    },
    variants: [
        { name: 'Beige', color: '#C8A67B', mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', mediaType: 'video'},
        { name: 'Navy', color: '#000080', mediaUrl: 'https://picsum.photos/seed/prod1-navy/1080/1920', mediaType: 'image'},
    ],
    creator: users[0],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    shopTheLookProductIds: ['prod2']
  },
  {
    id: 'prod2',
    name: 'Silk Charmeuse Blouse',
    price: 180.00,
    description: 'A fluid, lustrous silk blouse that drapes beautifully. Features a concealed placket and mother-of-pearl buttons for a touch of luxury.',
    fabric: {
        name: 'Silk Charmeuse',
        description: 'A lightweight fabric woven with a satin weave, where the front side is a lustrous satin finish, and the back has a dull, crepe finish.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric2/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    },
    variants: [
        { name: 'Ivory', color: '#FFFFF0', mediaUrl: 'https://picsum.photos/seed/prod2-ivory/1080/1920', mediaType: 'image'},
        { name: 'Black', color: '#000000', mediaUrl: 'https://picsum.photos/seed/prod2-black/1080/1920', mediaType: 'image'},
    ],
    creator: users[0],
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 'prod3',
    name: 'X-7 Utility Pant',
    price: 250.00,
    description: 'A technical cargo pant with articulated knees, multiple zip-pockets, and a water-repellent finish. Built for movement and utility.',
     fabric: {
        name: 'Ripstop Nylon',
        description: 'A woven fabric, often made of nylon, using a special reinforcing technique that makes it resistant to tearing and ripping.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric3/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
    variants: [
        { name: 'Graphite', color: '#36454F', mediaUrl: 'https://picsum.photos/seed/prod3-graphite/1080/1920', mediaType: 'image'},
        { name: 'Black', color: '#000000', mediaUrl: 'https://picsum.photos/seed/prod3-black/1080/1920', mediaType: 'image'},
    ],
    creator: users[1],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'prod4',
    name: 'Aero-Shell Jacket',
    price: 380.00,
    description: 'An ultralight, packable windbreaker made from a high-tech Japanese nylon. Features laser-cut ventilation and magnetic closures.',
    fabric: {
        name: 'Ultralight Nylon',
        description: 'A synthetic fabric known for its exceptional strength, elasticity, and abrasion resistance, while being incredibly lightweight.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric4/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    variants: [
        { name: 'Silver', color: '#C0C0C0', mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', mediaType: 'video'},
    ],
    creator: users[1],
    sizes: ['S', 'M', 'L'],
    shopTheLookProductIds: ['prod3']
  },
  {
    id: 'prod5',
    name: 'Breezy Linen Tunic',
    price: 155.00,
    description: 'An oversized linen tunic perfect for warm days or as a beach cover-up. Effortlessly chic and incredibly comfortable.',
    fabric: {
        name: 'European Flax Linen',
        description: 'A natural fiber made from the flax plant. It is known for its strength, breathability, and ability to soften with each wash.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric5/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    variants: [
        { name: 'White', color: '#FFFFFF', mediaUrl: 'https://picsum.photos/seed/prod5-white/1080/1920', mediaType: 'image'},
        { name: 'Sand', color: '#C2B280', mediaUrl: 'https://picsum.photos/seed/prod5-sand/1080/1920', mediaType: 'image'},
    ],
    creator: users[2],
    sizes: ['One Size']
  }
];

export const chatMessages: ChatMessage[] = [
    { id: 'msg1', text: 'Hi, does the Marais Trench run true to size?', senderId: 'user2', timestamp: '10:30 AM' },
    { id: 'msg2', text: 'Bonjour! Yes, it has a classic fit. We recommend taking your usual size. Let me know if you need measurements!', senderId: 'user1', timestamp: '10:31 AM' },
];