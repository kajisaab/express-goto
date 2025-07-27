import { ColumnOptions, Column, PrimaryColumn, PrimaryColumnOptions } from 'typeorm';

class NumericColumnTransformer {
    to(data: number): number {
        return data;
    }

    from(data: string): number {
        return parseFloat(data);
    }
}

export function PrimaryTextColumn(options: PrimaryColumnOptions = {}): PropertyDecorator {
    return PrimaryColumn({ type: 'text', ...options });
}

export function PrimaryIntegerColumn(options: PrimaryColumnOptions = {}): PropertyDecorator {
    return PrimaryColumn({
        type: 'integer',
        transformer: new NumericColumnTransformer(),
        ...options,
    });
}

export function PrimaryBigIntColumn(options: PrimaryColumnOptions = {}): PropertyDecorator {
    return PrimaryColumn({
        type: 'bigint',
        transformer: new NumericColumnTransformer(),
        ...options,
    });
}

export function PrimaryDateColumn(options: PrimaryColumnOptions = {}): PropertyDecorator {
    return PrimaryColumn({ type: 'date', ...options });
}

export function PrimaryTimestampColumn(options: PrimaryColumnOptions = {}): PropertyDecorator {
    return PrimaryColumn({ type: 'timestamp', ...options });
}

export function TextColumn(options: ColumnOptions = {}): PropertyDecorator {
    return Column({ type: 'text', nullable: true, ...options });
}

export function BooleanColumn(options: ColumnOptions = {}): PropertyDecorator {
    return Column({ type: 'boolean', nullable: true, ...options });
}

export function TimestampColumn(options: ColumnOptions = {}): PropertyDecorator {
    return Column({ type: 'timestamp', nullable: true, ...options });
}

export function DateColumn(options: ColumnOptions = {}): PropertyDecorator {
    return Column({ type: 'date', nullable: true, ...options });
}

export function IntegerColumn(options: ColumnOptions = {}): PropertyDecorator {
    return Column({
        type: 'integer',
        nullable: true,
        transformer: new NumericColumnTransformer(),
        ...options,
    });
}

export function BigIntColumn(options: ColumnOptions = {}): PropertyDecorator {
    return Column({
        type: 'bigint',
        nullable: true,
        transformer: new NumericColumnTransformer(),
        ...options,
    });
}

export function DecimalColumn(options: ColumnOptions = {}): PropertyDecorator {
    return Column({
        type: 'decimal',
        nullable: true,
        transformer: new NumericColumnTransformer(),
        ...options,
    });
}

export function JsonbColumn(options: ColumnOptions = {}): PropertyDecorator {
    return Column({ type: 'jsonb', nullable: true, ...options });
}
