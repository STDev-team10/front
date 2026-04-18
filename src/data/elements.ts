export interface ElementData {
  symbol: string;
  name: string;
  color: string;
  textColor: string;
}

export const ELEMENTS: ElementData[] = [
  { symbol: 'H',  name: '수소',   color: '#F9D56E', textColor: '#5C3D2E' },
  { symbol: 'O',  name: '산소',   color: '#A8D8EA', textColor: '#5C3D2E' },
  { symbol: 'C',  name: '탄소',   color: '#C5BFB5', textColor: '#5C3D2E' },
  { symbol: 'Na', name: '나트륨', color: '#FFB347', textColor: '#fff' },
  { symbol: 'Cl', name: '염소',   color: '#95DAC1', textColor: '#5C3D2E' },
  { symbol: 'N',  name: '질소',   color: '#C3A6E5', textColor: '#5C3D2E' },
  { symbol: 'S',  name: '황',     color: '#F3E584', textColor: '#5C3D2E' },
  { symbol: 'P',  name: '인',     color: '#FFB3B3', textColor: '#5C3D2E' },
  { symbol: 'Fe', name: '철',     color: '#D4A574', textColor: '#5C3D2E' },
  { symbol: 'Ca', name: '칼슘',   color: '#B5D5E8', textColor: '#5C3D2E' },
  { symbol: 'K',  name: '칼륨',   color: '#DDB5E8', textColor: '#5C3D2E' },
  { symbol: 'Mg', name: '마그네슘', color: '#A8E8B5', textColor: '#5C3D2E' },
];

export const ELEMENT_MAP = Object.fromEntries(ELEMENTS.map(e => [e.symbol, e]));
