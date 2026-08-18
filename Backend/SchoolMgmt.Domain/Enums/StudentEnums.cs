namespace SchoolMgmt.Domain.Enums;

public enum Gender
{
    Male,
    Female,
    NonBinary,
    PreferNotToSay
}

public enum BloodGroup
{
    Unknown,
    APlus,
    AMinus,
    BPlus,
    BMinus,
    OPlus,
    OMinus,
    ABPlus,
    ABMinus
}

public enum StudentStatus
{
    Enrolled,
    Active,
    Inactive,
    Transferred,
    Suspended,
    Graduated
}

public enum DocumentType
{
    BirthCertificate,
    AddressProof,
    Passport,
    Other
}

public enum Relationship
{
    Father,
    Mother,
    LegalGuardian,
    Other
}
