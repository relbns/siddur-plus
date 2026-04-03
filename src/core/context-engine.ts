import {
  HDate,
  HebrewCalendar,
  Location,
  Sedra,
  OmerEvent,
  Zmanim,
  flags as hebcalFlags,
} from '@hebcal/core';
import type { AppContext, UserSettings, ZmanimSet } from './types';

/**
 * Build the full AppContext from a date + settings.
 * Uses @hebcal/core for all calculations — pure algorithmic, zero network.
 */
export function buildContext(
  date: Date,
  settings: UserSettings,
  geolocation?: { lat: number; lng: number }
): AppContext {
  const hDate = new HDate(date);
  const dow = date.getDay();
  const isIsrael = settings.region === 'israel';

  // Build location if we have coords, or use Jerusalem as fallback for Zmanim if region is Israel
  let location = geolocation
    ? new Location(
        geolocation.lat,
        geolocation.lng,
        isIsrael,
        'Asia/Jerusalem'
      )
    : undefined;

  // Fallback to Jerusalem for Israel users if no geolocation (e.g. non-secure context)
  if (!location && isIsrael) {
    location = new Location(31.7683, 35.2137, true, 'Asia/Jerusalem');
  }

  const events = HebrewCalendar.calendar({
    start: date,
    end: date,
    il: isIsrael,
    sedrot: true,
    omer: true,
    candlelighting: !!location,
    location,
  });

  // Analyze events to build flags
  let isShabbat = dow === 6;
  const isErevShabbat = dow === 5;
  let isYomTov = false;
  let isErevYomTov = false;
  let isCholHamoed = false;
  let isRoshChodesh = false;
  let isChanukah = false;
  let isPurim = false;
  let isFastDay = false;
  let isPesach = false;
  let isSukkot = false;
  let isShavuot = false;
  let isRoshHashana = false;
  let isYomKippur = false;
  let sefiraDay: number | null = null;
  let sefiraDayHe: string | null = null;
  let parasha: string | null = null;
  let holidayName: string | null = null;
  let candleLighting: Date | null = null;
  let havdalah: Date | null = null;

  for (const ev of events) {
    const mask = ev.getFlags();
    const desc = ev.getDesc();

    if (mask & hebcalFlags.CHAG) isYomTov = true;
    if (mask & hebcalFlags.CHOL_HAMOED) isCholHamoed = true;
    if (mask & hebcalFlags.ROSH_CHODESH) isRoshChodesh = true;
    if (mask & hebcalFlags.MINOR_FAST || mask & hebcalFlags.MAJOR_FAST) isFastDay = true;
    if (mask & hebcalFlags.EREV) {
      if (desc.includes('Shabbat')) {
        // isErevShabbat already set by dow
      } else {
        isErevYomTov = true;
      }
    }
    if (mask & hebcalFlags.LIGHT_CANDLES || mask & hebcalFlags.LIGHT_CANDLES_TZEIS) {
      candleLighting = (ev as unknown as { eventTime?: Date }).eventTime ?? null;
    }
    if (mask & hebcalFlags.YOM_TOV_ENDS) {
      havdalah = (ev as unknown as { eventTime?: Date }).eventTime ?? null;
    }
    if (mask & hebcalFlags.PARSHA_HASHAVUA) {
      parasha = ev.render('he-x-NoNikud');
    }

    // Collect holiday name in Hebrew (without nikud)
    if (mask & (hebcalFlags.CHAG | hebcalFlags.CHOL_HAMOED | hebcalFlags.MINOR_HOLIDAY | hebcalFlags.MAJOR_FAST | hebcalFlags.MINOR_FAST)) {
      holidayName = ev.render('he-x-NoNikud');
    }

    // Check for Omer
    if (ev instanceof OmerEvent || (mask & hebcalFlags.OMER_COUNT)) {
      sefiraDay = (ev as any).omer || (ev as any).count;
      sefiraDayHe = ev.render('he-x-NoNikud');
    }

    // Holidays
    if (desc.includes('Chanukah')) isChanukah = true;
    if (desc.includes('Purim')) isPurim = true;
    if (desc.includes('Pesach')) isPesach = true;
    if (desc.includes('Sukkot')) isSukkot = true;
    if (desc.includes('Shavuot')) isShavuot = true;
    if (desc.includes('Rosh Hashana')) isRoshHashana = true;
    if (desc.includes('Yom Kippur')) isYomKippur = true;
  }

  // Calculate Havdalah on Erev Shabbat for the upcoming Saturday
  if (isErevShabbat && !havdalah && location) {
    const saturday = new Date(date);
    saturday.setDate(saturday.getDate() + 1);
    const shabbatEvents = HebrewCalendar.calendar({
      start: saturday,
      end: saturday,
      location,
      il: isIsrael,
      candlelighting: true,
    });
    for (const ev of shabbatEvents) {
      if (ev.getFlags() & hebcalFlags.YOM_TOV_ENDS) {
        havdalah = (ev as unknown as { eventTime?: Date }).eventTime ?? null;
      }
    }
  }

  // Parasha fallback (always show Parasha, especially on Fridays, even during holidays)
  if (!parasha) {
    try {
      const sedra = new Sedra(hDate.getFullYear(), isIsrael);
      
      // Get upcoming Shabbat sedra
      const nextShabbat = hDate.onOrAfter(6);
      const parts = sedra.getString(nextShabbat, 'he-x-NoNikud');
      if (parts && !/[a-zA-Z]/.test(parts)) {
        parasha = parts;
      }
    } catch {
      parasha = null;
    }
  }

  // Zmanim calculation
  let zmanim: ZmanimSet | null = null;
  if (location) {
    const z = new Zmanim(location, date, isIsrael);
    zmanim = {
      alotHashachar: z.alotHaShachar(),
      misheyakir: z.misheyakir(),
      sunrise: z.neitzHaChama(),
      sofZmanShmaMGA: z.sofZmanShmaMGA(),
      sofZmanShma: z.sofZmanShma(),
      sofZmanTfillaMGA: z.sofZmanTfillaMGA(),
      sofZmanTfilla: z.sofZmanTfilla(),
      chatzot: z.chatzot(),
      minchaGedola: z.minchaGedola(),
      minchaKetana: z.minchaKetana(),
      plagHamincha: z.plagHaMincha(),
      sunset: z.shkiah(),
      tzeitHakochavim: z.tzeit(),
      chatzotNight: z.chatzotNight(),
    };
  }

  // Time-of-day slot
  const hour = date.getHours();
  let currentTimeSlot: AppContext['currentTimeSlot'] = 'morning';
  if (hour >= 12 && hour < 16) currentTimeSlot = 'afternoon';
  else if (hour >= 16 && hour < 20) currentTimeSlot = 'evening';
  else if (hour >= 20 || hour < 5) currentTimeSlot = 'night';

  // Derived Halachic flags
  const hMonth = hDate.getMonth();
  const hDay = hDate.getDate();

  const noTachanunMonth = hMonth === 1; // Nisan
  const noTachanunDays =
    isShabbat ||
    isYomTov ||
    isCholHamoed ||
    isRoshChodesh ||
    isChanukah ||
    isPurim ||
    noTachanunMonth ||
    (hMonth === 7 && hDay >= 1 && hDay <= 13) || // Tishrei 1-13
    (hMonth === 3 && hDay >= 1 && hDay <= 7) ||   // Sivan 1-7
    (hMonth === 5 && hDay === 15);                 // Tu B'Av
  const tachanunAllowed = !noTachanunDays;

  const tefillinAllowed = !isShabbat && !isYomTov && (isIsrael ? !isCholHamoed : true);

  let hallelType: AppContext['hallelType'] = 'none';
  if (isChanukah || (isPesach && (hDay === 15 || (hDay === 16 && !isIsrael)))) {
    hallelType = 'full';
  } else if (isRoshChodesh || isCholHamoed || (isPesach && hDay > 16)) {
    hallelType = 'half';
  } else if (isSukkot || isShavuot) {
    hallelType = 'full';
  }

  const yaalehVeyavo = isRoshChodesh || isCholHamoed || isPesach || isSukkot || isShavuot;

  let alHanisim: AppContext['alHanisim'] = 'none';
  if (isChanukah) alHanisim = 'chanukah';
  if (isPurim) alHanisim = 'purim';

  const moridHatal = hMonth >= 1 && hMonth <= 6;
  const barechAleinu = isIsrael
    ? hMonth >= 8 || (hMonth === 7 && hDay >= 7)
    : date.getMonth() >= 11 || date.getMonth() <= 2;

  // Build flags array
  const contextFlags: string[] = [];
  if (isShabbat) contextFlags.push('IS_SHABBAT');
  if (isErevShabbat) contextFlags.push('IS_EREV_SHABBAT');
  if (isYomTov) contextFlags.push('IS_YOM_TOV');
  if (isErevYomTov) contextFlags.push('IS_EREV_YOM_TOV');
  if (isCholHamoed) contextFlags.push('IS_CHOL_HAMOED');
  if (isRoshChodesh) contextFlags.push('IS_ROSH_CHODESH');
  if (isChanukah) contextFlags.push('IS_CHANUKAH');
  if (isPurim) contextFlags.push('IS_PURIM');
  if (isFastDay) contextFlags.push('IS_FAST_DAY');
  if (isPesach) contextFlags.push('IS_PESACH');
  if (isSukkot) contextFlags.push('IS_SUKKOT');
  if (isShavuot) contextFlags.push('IS_SHAVUOT');
  if (isRoshHashana) contextFlags.push('IS_ROSH_HASHANA');
  if (isYomKippur) contextFlags.push('IS_YOM_KIPPUR');
  if (tachanunAllowed) contextFlags.push('TACHANUN');
  if (tefillinAllowed) contextFlags.push('TEFILLIN');
  if (hallelType !== 'none') contextFlags.push(`HALLEL_${hallelType.toUpperCase()}`);
  if (yaalehVeyavo) contextFlags.push('YAALEH_VEYAVO');
  if (alHanisim !== 'none') contextFlags.push(`AL_HANISIM_${alHanisim.toUpperCase()}`);
  if (sefiraDay !== null) contextFlags.push('SEFIRAT_HAOMER');
  if (moridHatal) contextFlags.push('MORID_HATAL');
  else contextFlags.push('MASHIV_HARUACH');
  if (barechAleinu) contextFlags.push('BARECH_ALEINU');
  else contextFlags.push('BARECH_ALEINU_SUMMER');

  // Prayer Mode flags
  if (settings.prayerMode === 'chazan') contextFlags.push('MODE_CHAZAN');
  else if (settings.prayerMode === 'yachid') contextFlags.push('MODE_YACHID');
  else contextFlags.push('MODE_REGULAR');

  return {
    effectiveDate: date,
    hebrewDate: hDate.renderGematriya(true),
    dayOfWeek: dow,
    parasha,
    holidayName,
    zmanim,
    currentTimeSlot,
    isShabbat,
    isErevShabbat,
    isYomTov,
    isErevYomTov,
    isCholHamoed,
    isRoshChodesh,
    isChanukah,
    isPurim,
    isFastDay,
    isPesach,
    isSukkot,
    isShavuot,
    isRoshHashana,
    isYomKippur,
    tachanunAllowed,
    tefillinAllowed,
    hallelType,
    yaalehVeyavo,
    alHanisim,
    sefiraDay,
    sefiraDayHe,
    moridHatal,
    barechAleinu,
    candleLighting,
    havdalah,
    flags: contextFlags,
    nusach: settings.nusach,
    region: settings.region,
  };
}
