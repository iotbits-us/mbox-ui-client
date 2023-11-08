/**
 * Represents the manifest of the application.
 */
export type Manifest = {
  version: string;
  slaves: SlaveFromManifest[];
};

/**
 * Represents a slave device in the manifest.
 */
export type SlaveFromManifest = {
  id: number;
  type: string;
  device_manufacturer: string;
  device_model: string;
  supported_baudrates: number[];
  functions: SlaveFunction[];
  regs16: Reg16[];
  regs32: Reg32[];
};

/**
 * Represents a 16-bit register.
 */
export type Reg16 = {
  address: number;
  name: string;
  info: string;
  short_name: string;
  enabled: boolean;
  size: number;
  dp: number;
  table_type: number;
  offset: number;
  lastRead?: number;
  readTime?: number;
  hasFailed?: boolean;
  onlyifchg?: boolean;
};

/**
 * Represents a 32-bit register.
 */
export type Reg32 = {
  address: number;
  name: string;
  info: string;
  short_name: string;
  enabled: boolean;
  size: number;
  dp: number;
  table_type: number;
  offset: number;
  IEEE754: boolean;
  lastRead?: number;
  readTime?: number;
  hasFailed?: boolean;
};

/**
 * Represents a function for an Slave in the manifest.
 */
export type SlaveFunction = {
  name: string;
  label: string;
  reg_grp: number;
  reg: number;
  threshold: number;
  options: SlaveFunctionOption[];
};

/**
 * Represents an option for a function.
 */
export type SlaveFunctionOption = {
  name: string;
  type: "fixed" | "input";
  label: string;
  val?: number;
  override?: boolean;
  min?: number;
  max?: number;
  command?: FunctionOptionCommand;
};

/**
 * Represents a command option for a function.
 */
export type FunctionOptionCommand = {
  functionName: string;
  optionName: string;
  value?: any;
};
