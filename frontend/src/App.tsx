import { useEffect, useState } from 'react';

import type { FormEvent } from 'react';

interface MachineRegistrationResult {
  id: string;
  estado: string;
}

interface ApiError {
  message?: string;
}

interface MachineSummary {
  id: string;
  localizacao: string;
  modelo: string;
  estado: 'online' | 'alerta' | 'offline';
  ultimaAtualizacao: string | null;
}

interface MachineDetails extends MachineSummary {
  temperatura: number | null;
  estadoOperacional: string | null;
  produtos: unknown[];
  lotes: unknown[];
  dadosAtuais: boolean;
}

interface StockLot {
  produtoId: string;
  validade: string;
  diasRestantes: number;
  estado: 'Dentro da validade' | 'Perto da validade' | 'Expirado';
  avisoRemocaoObrigatoria: string | null;
}

interface StockProduct {
  produtoId: string;
  nome: string;
  unidades: number;
  capacidadeMaxima: number;
  stockMinimo: number;
  estado: 'Disponível' | 'Stock baixo' | 'Esgotado';
  lotes: StockLot[];
}

interface MachineStock {
  maquinaId: string;
  ultimaAtualizacao: string | null;
  dadosAtuais: boolean;
  produtos: StockProduct[];
}

type StockFilter = 'stock-baixo' | 'perto-validade' | 'expirado' | '';

function formatMachineState(state: MachineSummary['estado']): string {
  if (state === 'alerta') return 'Com alerta';
  return state === 'online' ? 'Online' : 'Offline';
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(timestamp));
}

function formatValidityDate(validade: string): string {
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeZone: 'UTC' }).format(
    new Date(`${validade}T00:00:00Z`),
  );
}

function formatDaysRemaining(days: number): string {
  return `${days} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`;
}

function getStockStateClass(state: StockProduct['estado']): string {
  if (state === 'Esgotado') return 'stock-state--empty';
  if (state === 'Stock baixo') return 'stock-state--low';
  return 'stock-state--available';
}

function getExpiryStateClass(state: StockLot['estado']): string {
  if (state === 'Expirado') return 'expiry-state--expired';
  if (state === 'Perto da validade') return 'expiry-state--near';
  return 'expiry-state--valid';
}

function App() {
  const [estado, setEstado] = useState('a verificar...');
  const [registrationResult, setRegistrationResult] = useState<MachineRegistrationResult | null>(null);
  const [registrationError, setRegistrationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [machines, setMachines] = useState<MachineSummary[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [machineDetails, setMachineDetails] = useState<MachineDetails | null>(null);
  const [machineStock, setMachineStock] = useState<MachineStock | null>(null);
  const [stockFilter, setStockFilter] = useState<StockFilter>('');
  const [stockQuery, setStockQuery] = useState('');
  const [machinesLoading, setMachinesLoading] = useState(true);
  const [machineDetailsLoading, setMachineDetailsLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [machineError, setMachineError] = useState('');
  const [stockError, setStockError] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((dados) =>
        setEstado(
          dados.status === 'ok' && dados.db === 'ok'
            ? 'API e base de dados OK'
            : 'Erro na API',
        ),
      )
      .catch(() => setEstado('API indisponível'));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const refreshMachines = async (): Promise<void> => {
      try {
        const response = await fetch('/api/machines', { signal: controller.signal });
        if (!response.ok) throw new Error('Não foi possível carregar as máquinas.');
        const loadedMachines = (await response.json()) as MachineSummary[];
        if (controller.signal.aborted) return;
        setMachines(loadedMachines);
        setSelectedMachineId((current) => current || loadedMachines[0]?.id || '');
        setMachineError('');
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setMachineError(error instanceof Error ? error.message : 'Não foi possível carregar as máquinas.');
        }
      } finally {
        if (!controller.signal.aborted) setMachinesLoading(false);
      }
    };

    void refreshMachines();
    const refreshInterval = window.setInterval(() => void refreshMachines(), 15_000);

    return () => {
      window.clearInterval(refreshInterval);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!selectedMachineId) {
      setMachineDetails(null);
      return;
    }

    const controller = new AbortController();
    setMachineDetails(null);
    setMachineDetailsLoading(true);
    setMachineError('');

    const refreshMachine = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/machines/${encodeURIComponent(selectedMachineId)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Não foi possível carregar o estado da máquina.');
        const details = (await response.json()) as MachineDetails;
        if (!controller.signal.aborted) setMachineDetails(details);
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setMachineError(error instanceof Error ? error.message : 'Não foi possível carregar o estado da máquina.');
        }
      } finally {
        if (!controller.signal.aborted) setMachineDetailsLoading(false);
      }
    };

    void refreshMachine();
    const refreshInterval = window.setInterval(() => void refreshMachine(), 15_000);

    return () => {
      window.clearInterval(refreshInterval);
      controller.abort();
    };
  }, [selectedMachineId]);

  useEffect(() => {
    if (!selectedMachineId) {
      setMachineStock(null);
      setStockLoading(false);
      setStockError('');
      return;
    }

    const controller = new AbortController();
    setMachineStock(null);
    setStockLoading(true);
    setStockError('');

    const refreshStock = async (): Promise<void> => {
      try {
        const query = new URLSearchParams();
        if (stockFilter) query.set('filtro', stockFilter);
        if (stockQuery.trim()) query.set('q', stockQuery.trim());
        const queryString = query.size > 0 ? `?${query.toString()}` : '';
        const response = await fetch(`/api/machines/${encodeURIComponent(selectedMachineId)}/stock${queryString}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Não foi possível carregar o stock da máquina.');
        const stock = (await response.json()) as MachineStock;
        if (!controller.signal.aborted) setMachineStock(stock);
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setStockError(error instanceof Error ? error.message : 'Não foi possível carregar o stock da máquina.');
        }
      } finally {
        if (!controller.signal.aborted) setStockLoading(false);
      }
    };

    void refreshStock();
    const refreshInterval = window.setInterval(() => void refreshStock(), 15_000);

    return () => {
      window.clearInterval(refreshInterval);
      controller.abort();
    };
  }, [selectedMachineId, stockFilter, stockQuery]);

  async function submitRegistration(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setRegistrationResult(null);
    setRegistrationError('');

    const formData = new FormData(event.currentTarget);
    const input = {
      sensorId: String(formData.get('sensorId') ?? ''),
      localizacao: String(formData.get('localizacao') ?? ''),
      modelo: String(formData.get('modelo') ?? ''),
      clienteId: String(formData.get('clienteId') ?? ''),
    };

    try {
      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const body = (await response.json().catch(() => ({}))) as MachineRegistrationResult & ApiError;

      if (!response.ok) {
        setRegistrationError(body.message ?? 'Não foi possível registar a máquina.');
        return;
      }

      setRegistrationResult({ id: body.id, estado: body.estado });
    } catch {
      setRegistrationError('Não foi possível contactar a API.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <h1>God’s Eye</h1>
      <p data-testid="estado-api">{estado}</p>
      <section className="machine-section" aria-labelledby="machine-status-heading">
        <h2 id="machine-status-heading">Estado das máquinas</h2>
        <label htmlFor="machine-selector">Máquina</label>
        <select
          id="machine-selector"
          data-testid="machine-selector"
          value={selectedMachineId}
          onChange={(event) => setSelectedMachineId(event.currentTarget.value)}
          disabled={machinesLoading || machines.length === 0}
        >
          <option value="" disabled>
            {machinesLoading ? 'A carregar máquinas…' : 'Selecione uma máquina'}
          </option>
          {machines.map((machine) => (
            <option key={machine.id} value={machine.id}>
              {machine.localizacao} — {machine.modelo}
            </option>
          ))}
        </select>

        {machineError && <p className="machine-error" role="alert">{machineError}</p>}
        {machineDetailsLoading && <p data-testid="machine-loading">A carregar estado…</p>}
        {!machinesLoading && machines.length === 0 && !machineError && (
          <p data-testid="machine-empty">Não existem máquinas registadas.</p>
        )}
        {machineDetails && (
          <div className={`machine-card machine-card--${machineDetails.estado}`}>
            <p className="machine-state-row">Estado <strong data-testid="machine-state">{formatMachineState(machineDetails.estado)}</strong></p>
            <p data-testid="machine-data-status" className="machine-freshness">
              {machineDetails.dadosAtuais ? 'Dados atuais' : 'Últimos dados recebidos — não atuais'}
            </p>
            <dl className="machine-details">
              <div>
                <dt>{machineDetails.dadosAtuais ? 'Temperatura atual' : 'Última temperatura conhecida'}</dt>
                <dd data-testid="machine-temperature">
                  {machineDetails.temperatura === null ? 'Sem valor' : `${machineDetails.temperatura} °C`}
                </dd>
              </div>
              <div>
                <dt>{machineDetails.dadosAtuais ? 'Estado operacional' : 'Último estado operacional'}</dt>
                <dd data-testid="machine-operational-status">
                  {machineDetails.estadoOperacional ?? 'Sem valor'}
                </dd>
              </div>
              <div>
                <dt>Última atualização</dt>
                <dd>
                  {machineDetails.ultimaAtualizacao ? (
                    <time data-testid="machine-last-updated" dateTime={machineDetails.ultimaAtualizacao}>
                      {formatTimestamp(machineDetails.ultimaAtualizacao)}
                    </time>
                  ) : (
                    <span data-testid="machine-last-updated">Sem leituras recebidas</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      <section className="stock-section" aria-labelledby="stock-heading">
        <h2 id="stock-heading">Stock e validades</h2>
        <div className="stock-controls">
          <label htmlFor="stock-filter">Filtrar stock</label>
          <select
            id="stock-filter"
            data-testid="stock-filter"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.currentTarget.value as StockFilter)}
          >
            <option value="">Todos os produtos e lotes</option>
            <option value="stock-baixo">Stock baixo</option>
            <option value="perto-validade">Perto da validade</option>
            <option value="expirado">Expirado</option>
          </select>
          <label htmlFor="stock-search">Pesquisar produto</label>
          <input
            id="stock-search"
            data-testid="stock-search"
            type="search"
            value={stockQuery}
            onChange={(event) => setStockQuery(event.currentTarget.value)}
            placeholder="Nome do produto"
          />
        </div>
        {stockLoading && <p data-testid="stock-loading">A carregar stock…</p>}
        {stockError && <p className="stock-error" data-testid="stock-error" role="alert">{stockError}</p>}
        {machineStock && (
          <div className="stock-freshness" data-testid="stock-data-status">
            <p>{machineStock.dadosAtuais ? 'Stock atual' : 'Último stock conhecido — dados não atuais'}</p>
            <p>
              Última atualização:{' '}
              {machineStock.ultimaAtualizacao ? (
                <time data-testid="stock-last-updated" dateTime={machineStock.ultimaAtualizacao}>
                  {formatTimestamp(machineStock.ultimaAtualizacao)}
                </time>
              ) : (
                <span data-testid="stock-last-updated">Sem leituras recebidas</span>
              )}
            </p>
          </div>
        )}
        {!stockLoading && machineStock?.produtos.length === 0 && (
          <p data-testid="stock-empty">
            {stockFilter || stockQuery.trim()
              ? 'Não foram encontrados produtos com os critérios selecionados.'
              : 'Não existem produtos registados nesta máquina.'}
          </p>
        )}
        {machineStock && machineStock.produtos.length > 0 && (
          <ul className="stock-products" data-testid="stock-products">
            {machineStock.produtos.map((product) => (
              <li
                className={`stock-product ${getStockStateClass(product.estado)}`}
                data-product-id={product.produtoId}
                data-testid="stock-product"
                key={product.produtoId}
              >
                <article>
                  <h3 data-testid="stock-product-name">{product.nome}</h3>
                  <p className={`stock-state ${getStockStateClass(product.estado)}`} data-testid="stock-state">
                    {product.estado}
                  </p>
                  <dl className="stock-product-details">
                    <div>
                      <dt>Unidades</dt>
                      <dd data-testid="stock-quantity">{product.unidades}</dd>
                    </div>
                    <div>
                      <dt>Capacidade máxima</dt>
                      <dd data-testid="stock-capacity">{product.capacidadeMaxima}</dd>
                    </div>
                    <div>
                      <dt>Stock mínimo</dt>
                      <dd data-testid="stock-minimum">{product.stockMinimo}</dd>
                    </div>
                  </dl>
                  <h4>Lotes</h4>
                  {product.lotes.length > 0 ? (
                    <ul className="stock-lots">
                      {product.lotes.map((lot, index) => (
                        <li
                          className={`stock-lot ${getExpiryStateClass(lot.estado)}`}
                          data-testid="stock-lot"
                          key={`${lot.validade}-${index}`}
                        >
                          <span>Validade: </span>
                          <time data-testid="stock-lot-expiry" dateTime={lot.validade}>
                            {formatValidityDate(lot.validade)}
                          </time>
                          <span className="stock-lot-days" data-testid="stock-lot-days">
                            {formatDaysRemaining(lot.diasRestantes)}
                          </span>
                          <strong className={`stock-lot-state ${getExpiryStateClass(lot.estado)}`} data-testid="stock-lot-state">
                            {lot.estado}
                          </strong>
                          {lot.avisoRemocaoObrigatoria && (
                            <p className="stock-lot-removal-warning" data-testid="stock-lot-removal-warning" role="alert">
                              {lot.avisoRemocaoObrigatoria}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sem lotes registados.</p>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="registration-heading">
        <h2 id="registration-heading">Registar máquina</h2>
        <form data-testid="registration-form" onSubmit={(event) => void submitRegistration(event)}>
          <label htmlFor="sensorId">Identificador do sensor</label>
          <input id="sensorId" name="sensorId" data-testid="sensor-id" required />

          <label htmlFor="localizacao">Localização</label>
          <input id="localizacao" name="localizacao" data-testid="machine-location" required />

          <label htmlFor="modelo">Modelo</label>
          <input id="modelo" name="modelo" data-testid="machine-model" required />

          <label htmlFor="clienteId">Cliente</label>
          <input id="clienteId" name="clienteId" data-testid="customer-id" required />

          <button data-testid="register-machine" type="submit" disabled={submitting}>
            {submitting ? 'A registar…' : 'Registar máquina'}
          </button>
        </form>
        {registrationResult && (
          <p data-testid="registration-result" role="status">
            Máquina registada. ID: {registrationResult.id}. Estado: {registrationResult.estado}.
          </p>
        )}
        {registrationError && (
          <p data-testid="registration-error" role="alert">
            {registrationError}
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
