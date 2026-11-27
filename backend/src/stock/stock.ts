export const DEFAULT_NEAR_EXPIRY_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const OFFLINE_AFTER_MILLISECONDS = 15 * 60 * 1000;

export type ProductStockState = 'Disponível' | 'Stock baixo' | 'Esgotado';
export type LotExpiryState = 'Dentro da validade' | 'Perto da validade' | 'Expirado';
export type StockFilter = 'stock-baixo' | 'perto-validade' | 'expirado';

export interface StockProductReading {
  produtoId: string;
  nome: string;
  unidades: number;
  capacidadeMaxima: number;
  stockMinimo: number;
}

export interface StockLotReading {
  produtoId: string;
  validade: string;
}

export interface StockLot extends StockLotReading {
  diasRestantes: number;
  estado: LotExpiryState;
  avisoRemocaoObrigatoria: string | null;
}

export interface StockProduct extends StockProductReading {
  estado: ProductStockState;
  lotes: StockLot[];
}

export interface MachineStockRecord {
  maquinaId: string;
  ultimaAtualizacao: Date | null;
  produtos: unknown[];
  lotes: unknown[];
}

export interface MachineStock {
  maquinaId: string;
  ultimaAtualizacao: string | null;
  dadosAtuais: boolean;
  produtos: StockProduct[];
}

export interface StockRepository {
  findByMachineId(id: string): Promise<MachineStockRecord | null>;
}

export function calculateProductStockState(
  unidades: number,
  stockMinimo: number,
): ProductStockState {
  if (unidades === 0) return 'Esgotado';
  if (unidades < stockMinimo) return 'Stock baixo';
  return 'Disponível';
}

export function calculateLotExpiryState(
  diasRestantes: number,
  nearExpiryDays = DEFAULT_NEAR_EXPIRY_DAYS,
): LotExpiryState {
  if (diasRestantes < 0) return 'Expirado';
  if (diasRestantes <= nearExpiryDays) return 'Perto da validade';
  return 'Dentro da validade';
}

export function calculateDaysRemaining(validade: string, now: Date = new Date()): number {
  const expiryDate = normalizeValidityDate(validade);
  const [year, month, day] = expiryDate.split('-').map(Number);
  const expiryDay = Date.UTC(year!, month! - 1, day!);
  const currentDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((expiryDay - currentDay) / MILLISECONDS_PER_DAY);
}

export class StockService {
  constructor(
    private readonly repository: StockRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async getByMachineId(
    id: string,
    filter?: StockFilter,
    query?: string,
  ): Promise<MachineStock | null> {
    if (!isUuid(id)) return null;

    const record = await this.repository.findByMachineId(id);
    if (!record) return null;

    const products = record.produtos.map(parseProduct);
    const lots = record.lotes.map(parseLot);
    const now = this.clock();

    const filteredProducts = products
      .map((product) => ({
        ...product,
        estado: calculateProductStockState(product.unidades, product.stockMinimo),
        lotes: lots
          .filter((lot) => lot.produtoId === product.produtoId)
          .map((lot) => {
            const diasRestantes = calculateDaysRemaining(lot.validade, now);
            return {
              ...lot,
              diasRestantes,
              estado: calculateLotExpiryState(diasRestantes),
              avisoRemocaoObrigatoria:
                diasRestantes < 0 ? 'Remoção obrigatória' : null,
            };
          }),
      }))
      .filter((product) => matchesProductName(product.nome, query))
      .map((product) => applyStockFilter(product, filter))
      .filter((product): product is StockProduct => product !== null);

    return {
      maquinaId: record.maquinaId,
      ultimaAtualizacao: record.ultimaAtualizacao?.toISOString() ?? null,
      dadosAtuais:
        record.ultimaAtualizacao !== null &&
        now.getTime() - record.ultimaAtualizacao.getTime() <= OFFLINE_AFTER_MILLISECONDS,
      produtos: filteredProducts,
    };
  }
}

function matchesProductName(name: string, query?: string): boolean {
  if (!query?.trim()) return true;
  return normalizeSearchText(name).includes(normalizeSearchText(query));
}

function normalizeSearchText(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-PT');
}

function applyStockFilter(product: StockProduct, filter?: StockFilter): StockProduct | null {
  if (filter === 'stock-baixo') {
    return product.estado === 'Stock baixo' ? product : null;
  }

  if (filter === 'perto-validade' || filter === 'expirado') {
    const expiryState = filter === 'expirado' ? 'Expirado' : 'Perto da validade';
    const matchingLots = product.lotes.filter((lot) => lot.estado === expiryState);
    return matchingLots.length > 0 ? { ...product, lotes: matchingLots } : null;
  }

  return product;
}

function parseProduct(value: unknown): StockProductReading {
  if (!isObject(value)) throw new Error('Produto inválido na leitura de stock.');

  const { produtoId, nome, unidades, capacidadeMaxima, stockMinimo } = value;
  if (
    typeof produtoId !== 'string' ||
    typeof nome !== 'string' ||
    !isNonNegativeInteger(unidades) ||
    !isNonNegativeInteger(capacidadeMaxima) ||
    !isNonNegativeInteger(stockMinimo)
  ) {
    throw new Error('Produto inválido na leitura de stock.');
  }

  return { produtoId, nome, unidades, capacidadeMaxima, stockMinimo };
}

function parseLot(value: unknown): StockLotReading {
  if (!isObject(value)) throw new Error('Lote inválido na leitura de stock.');

  const { produtoId, validade } = value;
  if (typeof produtoId !== 'string' || typeof validade !== 'string') {
    throw new Error('Lote inválido na leitura de stock.');
  }

  return { produtoId, validade: normalizeValidityDate(validade) };
}

function normalizeValidityDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.+)?$/.exec(value);
  if (!match || (value.length > 10 && Number.isNaN(Date.parse(value)))) {
    throw new Error(`Data de validade inválida: ${value}`);
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Data de validade inválida: ${value}`);
  }

  return `${yearText}-${monthText}-${dayText}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
