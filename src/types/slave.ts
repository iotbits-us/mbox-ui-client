export type Slave = {
  id: number;
  type?: string;
  manifest_id?: number;
  name?: string;
  enabled?: boolean;
  address?: number;
  baud_rate?: number;
  remote_ctrl_enabled?: boolean;
  remote_spdctrl_enabled?: boolean;
  regs16?: Register16[];
  regs32?: Register32[];
  functions?: SlaveFunction[];
  device_manufacturer?: string;
  device_model?: string;
};

type Register16 = {
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
  lastRead?: number;
  readTime?: number;
  hasFailed?: boolean;
};

type Register32 = {
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
  lastRead?: number;
  readTime?: number;
  hasFailed?: boolean;
};

type FunctionOption = {
  name: string;
  type: "fixed" | "input";
  label: string;
  val?: number;
  override?: boolean;
  min?: number;
  max?: number;
  funCommand?: FunCommand;
};

export type SlaveFunction = {
  name: string;
  label: string;
  reg_grp: number;
  reg: number;
  threshold: number;
  options: FunctionOption[];
};

export type FunCommand = {
  funName: string;
  optName: string;
  value?: any;
};
