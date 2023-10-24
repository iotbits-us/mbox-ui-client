export type Manifest = {
  version: string;
  slaves: Slave[];
};

type Option = {
  name: string;
  type: "fixed" | "input";
  label: string;
  val?: number;
  override?: boolean;
  min?: number;
  max?: number;
};

type Function = {
  name: string;
  label: string;
  reg_grp: number;
  reg: number;
  threshold: number;
  options: Option[];
};

type Reg16 = {
  address: number;
  name: string;
  info: string;
  short_name: string;
  enabled: boolean;
  size: number;
  dp: number;
  table_type: number;
  offset: number;
  onlyifchg?: boolean;
};

type Reg32 = {
  address: number;
  name: string;
  info: string;
  short_name: string;
  enabled: boolean;
  size: number;
  dp: number;
  table_type: number;
  IEEE754: boolean;
  offset: number;
};

type Slave = {
  id: number;
  type: string;
  device_manufacturer: string;
  device_model: string;
  supported_baudrates: number[];
  functions: Function[];
  regs16: Reg16[];
  regs32: Reg32[];
};
