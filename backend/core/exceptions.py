class ServiceError(Exception):
    """Classe base para erros da camada de serviço (Business Logic)"""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ProductAlreadyExistsError(ServiceError):
    """Levantado quando tenta criar um produto com nome duplicado"""
    pass

class ResourceNotFoundError(ServiceError):
    """Levantado quando um recurso não é encontrado"""
    pass
