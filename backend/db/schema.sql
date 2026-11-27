CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  location TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensor_associations (
  sensor_id TEXT PRIMARY KEY,
  machine_id UUID NOT NULL UNIQUE REFERENCES machines(id) ON DELETE CASCADE,
  associated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twins (
  machine_id UUID PRIMARY KEY REFERENCES machines(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS machine_readings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  source_timestamp TIMESTAMPTZ NOT NULL,
  temperature DOUBLE PRECISION NOT NULL,
  operational_status TEXT NOT NULL,
  products JSONB NOT NULL,
  lots JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS machine_readings_machine_timestamp_idx
  ON machine_readings (machine_id, source_timestamp DESC);
