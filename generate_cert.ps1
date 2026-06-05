# generate_cert.ps1
# Generate a self-signed certificate for insidefactz.xyz and www.insidefactz.xyz
# and save them as key.pem and cert.pem in the current folder.
# Then install the cert in the Trusted Root Certification Authorities store.

$certName = "insidefactz.xyz"
$altNames = @("insidefactz.xyz", "www.insidefactz.xyz")

Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host " Generating Self-Signed SSL Certificate (User Level) for:" -ForegroundColor Yellow
Write-Host " - insidefactz.xyz" -ForegroundColor Yellow
Write-Host " - www.insidefactz.xyz" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host ""

# Generate the certificate under CurrentUser to avoid admin privilege restrictions
try {
    $cert = New-SelfSignedCertificate -DnsName $altNames `
                                      -CertStoreLocation "cert:\CurrentUser\My" `
                                      -KeyExportPolicy Exportable `
                                      -KeySpec Signature `
                                      -KeyAlgorithm RSA `
                                      -KeyLength 2048 `
                                      -HashAlgorithm SHA256 `
                                      -NotAfter (Get-Date).AddYears(5) `
                                      -ErrorAction Stop

    Write-Host "[OK] Certificate created in CurrentUser\My store." -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to create certificate: $_" -ForegroundColor Red
    Exit 1
}

# Export the public certificate in Base64 (PEM format)
try {
    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    $certBase64 = [Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $certPem = "-----BEGIN CERTIFICATE-----`r`n$certBase64`r`n-----END CERTIFICATE-----"
    Set-Content -Path "cert.pem" -Value $certPem -Encoding Ascii -ErrorAction Stop
    Write-Host "[OK] Public Certificate saved to cert.pem." -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to export public certificate: $_" -ForegroundColor Red
    Exit 1
}

# Export the private key in PKCS#8 PEM format
try {
    $privateKey = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
    $pkcs8Bytes = $privateKey.ExportPkcs8PrivateKey()
    $keyBase64 = [Convert]::ToBase64String($pkcs8Bytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $keyPem = "-----BEGIN PRIVATE KEY-----`r`n$keyBase64`r`n-----END PRIVATE KEY-----"
    Set-Content -Path "key.pem" -Value $keyPem -Encoding Ascii -ErrorAction Stop
    Write-Host "[OK] Private Key saved to key.pem." -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to export private key: $_" -ForegroundColor Red
    Exit 1
}

# Copy the certificate to Trusted Root store for CurrentUser to ensure secure lock
try {
    $rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
    $rootStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    $rootStore.Add($cert)
    $rootStore.Close()
    Write-Host "[OK] Certificate registered in CurrentUser Trusted Root Store." -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Could not add to Trusted Root Store automatically: $_" -ForegroundColor Yellow
    Write-Host "You may need to manually import cert.pem into your browser's trusted certificate settings." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host " SUCCESS: SSL Certificate setup completed successfully!" -ForegroundColor Green
Write-Host " Please restart your Node server to apply the changes." -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
