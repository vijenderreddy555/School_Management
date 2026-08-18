namespace SchoolMgmt.Application.Common;

public class ApplicationException : Exception
{
    public ApplicationException(string message) : base(message) { }
}

public class NotFoundException : ApplicationException
{
    public NotFoundException(string message) : base(message) { }
}

public class ConflictException : ApplicationException
{
    public ConflictException(string message) : base(message) { }
}

public class CapacityExceededException : ApplicationException
{
    public CapacityExceededException(string message) : base(message) { }
}
