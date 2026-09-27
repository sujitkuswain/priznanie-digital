import { TaxFormUserInput } from '../types/TaxFormUserInput'
import { initTaxFormUserInputValues } from './initialValues'

// Dummy data for manual testing via /debug. Fills every section so each page
// and the final XML can be checked without clicking through the whole form.
export const debugTestData: TaxFormUserInput = {
  ...initTaxFormUserInputValues,

  prijem_zo_zivnosti: true,
  t1r10_prijmy: '30000',
  priloha3_r11_socialne: '3000',
  priloha3_r13_zdravotne: '1500',
  zaplatenePreddavky: '500',

  employed: true,
  uhrnPrijmovOdVsetkychZamestnavatelov: '24000',
  uhrnPovinnehoPoistnehoNaSocialnePoistenie: '2256',
  uhrnPovinnehoPoistnehoNaZdravotnePoistenie: '960',
  uhrnPreddavkovNaDan: '2800',
  udajeODanovomBonuseNaDieta: '0',

  dohoda: true,
  uhrnPrijmovZoVsetkychDohod: '1200',
  uhrnPovinnehoPoistnehoNaSocialnePoistenieDohody: '112',
  uhrnPovinnehoPoistnehoNaZdravotnePoistenieDohody: '48',
  uhrnPreddavkovNaDanDohody: '150',
  udajeODanovomBonuseNaDietaDohody: '0',

  r032_uplatnujem_na_partnera: true,
  partner_step: 4,
  partner_spolocna_domacnost: true,
  partner_podmienky: { '1': ['on'] },
  r032_partner_vlastne_prijmy: '1000',
  r031_priezvisko_a_meno: 'Partner Test',
  r031_rodne_cislo: '585815 / 1002',
  r032_partner_pocet_mesiacov: '12',

  hasChildren: 'yes',
  children: [
    {
      id: 0,
      priezviskoMeno: 'Child One',
      rodneCislo: '155310 / 1000',
      wholeYear: true,
      monthFrom: '0',
      monthTo: '11',
    },
    {
      id: 1,
      priezviskoMeno: 'Child Two',
      rodneCislo: '190722 / 1008',
      wholeYear: true,
      monthFrom: '0',
      monthTo: '11',
    },
  ],

  platil_prispevky_na_dochodok: true,
  zaplatene_prispevky_na_dochodok: '180',

  rent: true,
  rent_step: 4,
  vyskaPrijmovZPrenajmu: '3000',
  vydavkyZPrenajmu: '400',
  prenajomPrijemZPrilezitostnejCinnosti: false,
  vyskaOslobodenia: '500',

  r035_uplatnuje_uroky: true,
  hypoteka_step: 6,
  uroky_dalsi_uver_uplatnuje: false,
  uroky_zmluva_den_uzatvorenia: '14',
  uroky_zmluva_mesiac_uzatvorenia: '5',
  uroky_zmluva_rok_uzatvorenia: '2023',
  uroky_zaciatok_urocenia_den: '1',
  uroky_zaciatok_urocenia_mesiac: '6',
  uroky_zaciatok_urocenia_rok: '2023',
  uroky_dalsi_dlznik: false,
  uroky_splnam_vek_kriteria: true,
  uroky_splnam_prijem: true,
  r035_zaplatene_uroky: '1200',

  dve_percenta_rodicom: 'obidvom',
  dve_percenta_rodicA: {
    meno: 'Parent',
    priezvisko: 'One',
    rodneCislo: '550501 / 1006',
  },
  dve_percenta_rodicB: {
    meno: 'Parent',
    priezvisko: 'Two',
    rodneCislo: '585815 / 1002',
  },

  r005_meno: 'Test',
  r004_priezvisko: 'User',
  r001_dic: '1234567890',
  r003_nace: '62010 - Počítačové programovanie',
  r007_ulica: 'Mierová',
  r008_cislo: '4',
  r009_psc: '821 05',
  r010_obec: 'Bratislava',
  r011_stat: 'Slovensko',

  // valid example IBAN, only asked when a refund or bonus is paid out
  ziadamVyplatitDanovyBonusUrokPreplatok: true,
  iban: 'SK31 1200 0000 1987 4263 7541',
}
