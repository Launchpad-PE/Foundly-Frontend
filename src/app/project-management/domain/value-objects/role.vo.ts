export class RoleName {
  constructor(private readonly value: string) {
    if (!value || value.trim().length < 3) {
      throw new Error('Role name must have at least 3 characters');
    }
    if (value.length > 50) {
      throw new Error('Role name cannot exceed 50 characters');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class CardTitle {
  constructor(private readonly value: string) {
    if (!value || value.trim().length < 3) {
      throw new Error('Card title must have at least 3 characters');
    }
    if (value.length > 100) {
      throw new Error('Card title cannot exceed 100 characters');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class CardItem {
  constructor(private readonly description: string) {
    if (!description || description.trim().length < 2) {
      throw new Error('Card item must have at least 2 characters');
    }
    if (description.length > 200) {
      throw new Error('Card item cannot exceed 200 characters');
    }
  }

  getDescription(): string {
    return this.description;
  }
}

export class RoleCardInfo {
  constructor(
    public readonly title: CardTitle,
    public readonly items: CardItem[]
  ) {}

  addItem(item: string): void {
    this.items.push(new CardItem(item));
  }
}

export class Role {
  constructor(
    public readonly name: RoleName,
    public readonly cardInfo: RoleCardInfo
  ) {}
}
