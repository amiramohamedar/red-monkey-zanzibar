/* New Red Monkey: rooms, programs, excursions, transport and prices.
   ALL PRICES ARE IN USD AND ARE SAMPLE VALUES. Replace them with the hotel's real rates before going live.
   The site converts them to EUR, GBP and TZS automatically. */
window.RM_DATA = {
  contact: { whatsapp: '255652201535', email: '' },

  rooms: {
    ocean: { name: 'room.ocean', count: 'room.n21', text: 'room.oceanText', rate: 140, imgs: [21, 20, 16, 17, 35, 25, 24],
      feats: [['wave', 'f.view'], ['sun', 'f.terrace'], ['bed', 'f.canopy'], ['drop', 'f.rain'], ['wifi', 'f.wifi'], ['safe', 'f.safe']] },
    swim: { name: 'room.swim', count: 'room.n7', text: 'room.swimText', rate: 190, imgs: [10, 7, 22, 27, 33, 32],
      feats: [['pool', 'f.swim'], ['wave', 'f.oceanfront'], ['bed', 'f.sofa'], ['drop', 'f.rain'], ['fan', 'f.fan'], ['wifi', 'f.wifi']] }
  },

  /* price = per adult for the whole program; was = regular price per adult */
  programs: [
    { id: 'escape', name: 'pg.escape', desc: 'pg.escapeD', nights: 3, room: 'ocean', price: 390, was: 460, img: 12,
      incl: ['in.transfer2', 'in.hammam', 'in.massage', 'in.kizi'] },
    { id: 'explorer', name: 'pg.explorer', desc: 'pg.explorerD', nights: 5, room: 'ocean', price: 790, was: 920, img: 3,
      incl: ['in.transfer2', 'in.stonetown', 'in.jozani', 'in.safariblue', 'in.kizi'] },
    { id: 'honey', name: 'pg.honey', desc: 'pg.honeyD', nights: 4, room: 'swim', price: 720, was: 840, img: 20,
      incl: ['in.transfer2', 'in.couple', 'in.hammam', 'in.dhow', 'in.turndown'] },
    { id: 'ocean', name: 'pg.ocean', desc: 'pg.oceanD', nights: 6, room: 'ocean', price: 980, was: 1120, img: 11,
      incl: ['in.transfer2', 'in.dives', 'in.kite', 'in.mnemba', 'in.kizi'] }
  ],

  /* price per person */
  excursions: [
    { id: 'safariblue', icon: 'boat', time: 'cat.full', price: 65 },
    { id: 'stonetown', icon: 'city', time: 'cat.half', price: 35 },
    { id: 'jozani', icon: 'leaf', time: 'cat.half', price: 30 },
    { id: 'prison', icon: 'turtle', time: 'cat.half', price: 45 },
    { id: 'spice', icon: 'spice', time: 'cat.half', price: 30 },
    { id: 'mnemba', icon: 'mask', time: 'cat.full', price: 60 },
    { id: 'dolphins', icon: 'dolphin', time: 'cat.morning', price: 45 },
    { id: 'dhow', icon: 'sail', time: 'cat.sunset', price: 50 }
  ],

  /* price per vehicle, per trip */
  transport: [
    { id: 'airport1', icon: 'plane', time: 'cat.anytime', price: 40 },
    { id: 'airport2', icon: 'plane', time: 'cat.anytime', price: 75 },
    { id: 'ferry', icon: 'ferry', time: 'cat.anytime', price: 40 },
    { id: 'stonetown', icon: 'car', time: 'cat.anytime', price: 45 },
    { id: 'driver', icon: 'wheel', time: 'cat.full', price: 90 },
    { id: 'kizi', icon: 'sun', time: 'cat.sunset', price: 0 }
  ],

  currencies: {
    USD: { sym: '$', name: 'US Dollar' },
    EUR: { sym: '€', name: 'Euro' },
    GBP: { sym: '£', name: 'British Pound' },
    TZS: { sym: 'TSh', name: 'Tanzanian Shilling' }
  },
  fallbackRates: { USD: 1, EUR: 0.86, GBP: 0.76, TZS: 2450 }
};
