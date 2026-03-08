# rental-saas.ps1
# Run this script in PowerShell to create the complete project structure.

$root = "rental-saas"

# Create root directory
New-Item -ItemType Directory -Path $root -Force | Out-Null
Set-Location $root

# -------------------- BACKEND --------------------
New-Item -ItemType Directory -Path "backend" -Force | Out-Null
Set-Location "backend"

# Root files
@("manage.py", "runtime.txt", ".env", ".env.example") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}

# requirements
New-Item -ItemType Directory -Path "requirements" -Force | Out-Null
Set-Location "requirements"
@("base.txt", "dev.txt", "prod.txt") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}
Set-Location ".."

# celery
New-Item -ItemType Directory -Path "celery" -Force | Out-Null
Set-Location "celery"
New-Item -ItemType File -Path "__init__.py" -Force | Out-Null
Set-Location ".."

# config
New-Item -ItemType Directory -Path "config" -Force | Out-Null
Set-Location "config"
New-Item -ItemType File -Path "__init__.py" -Force | Out-Null
New-Item -ItemType File -Path "urls.py" -Force | Out-Null
New-Item -ItemType File -Path "wsgi.py" -Force | Out-Null
New-Item -ItemType Directory -Path "settings" -Force | Out-Null
Set-Location "settings"
New-Item -ItemType File -Path "__init__.py" -Force | Out-Null
@("base.py", "development.py", "production.py") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}
Set-Location "..\.."

# apps
New-Item -ItemType Directory -Path "apps" -Force | Out-Null
Set-Location "apps"
New-Item -ItemType File -Path "__init__.py" -Force | Out-Null

# core
$coreApps = @("core", "tenants", "accounts", "properties", "tenants_app", "payments", "caretakers", "notifications", "common")
foreach ($app in $coreApps) {
    New-Item -ItemType Directory -Path $app -Force | Out-Null
    Set-Location $app
    New-Item -ItemType Directory -Path "migrations" -Force | Out-Null
    Set-Location "migrations"
    New-Item -ItemType File -Path "__init__.py" -Force | Out-Null
    Set-Location ".."
    New-Item -ItemType File -Path "__init__.py" -Force | Out-Null

    # Common files for most apps
    $files = @("models.py", "views.py", "serializers.py", "permissions.py", "services.py")
    if ($app -eq "core") {
        $files = @("models.py", "permissions.py", "middleware.py", "validators.py", "services.py", "utils.py")
    } elseif ($app -eq "tenants") {
        $files = @("models.py", "views.py", "serializers.py", "permissions.py", "services.py", "utils.py")
    } elseif ($app -eq "accounts") {
        $files = @("models.py", "views.py", "serializers.py", "permissions.py", "services.py", "signals.py", "tasks.py", "validators.py", "backends.py")
    } elseif ($app -eq "notifications") {
        $files = @("models.py", "views.py", "serializers.py", "permissions.py", "services.py", "signals.py", "tasks.py", "utils.py")
    } elseif ($app -in @("properties","tenants_app","payments","caretakers")) {
        $files = @("models.py", "views.py", "serializers.py", "permissions.py", "services.py", "signals.py", "tasks.py", "validators.py")
    } elseif ($app -eq "common") {
        $files = @("__init__.py", "placeholder.txt")
    }

    foreach ($file in $files) {
        New-Item -ItemType File -Path $file -Force | Out-Null
    }
    Set-Location ".."
}
Set-Location ".." # back to backend

# static, media, templates
@("static", "media", "templates") | ForEach-Object {
    New-Item -ItemType Directory -Path $_ -Force | Out-Null
    Set-Location $_
    New-Item -ItemType File -Path ".gitkeep" -Force | Out-Null
    Set-Location ".."
}

Set-Location ".." # back to root

# -------------------- FRONTEND --------------------
New-Item -ItemType Directory -Path "frontend" -Force | Out-Null
Set-Location "frontend"

# public
New-Item -ItemType Directory -Path "public" -Force | Out-Null
Set-Location "public"
New-Item -ItemType Directory -Path "icons" -Force | Out-Null
Set-Location "icons"
New-Item -ItemType File -Path ".gitkeep" -Force | Out-Null
Set-Location ".."
New-Item -ItemType Directory -Path "locales" -Force | Out-Null
Set-Location "locales"
@("en", "es") | ForEach-Object {
    New-Item -ItemType Directory -Path $_ -Force | Out-Null
    Set-Location $_
    New-Item -ItemType File -Path "translation.json" -Force | Out-Null
    Set-Location ".."
}
Set-Location ".."
@("service-worker.js", "manifest.json", "index.html") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}
Set-Location ".."

# src
New-Item -ItemType Directory -Path "src" -Force | Out-Null
Set-Location "src"

# assets
New-Item -ItemType Directory -Path "assets" -Force | Out-Null
Set-Location "assets"
New-Item -ItemType File -Path ".gitkeep" -Force | Out-Null
Set-Location ".."

# components/shared
New-Item -ItemType Directory -Path "components" -Force | Out-Null
Set-Location "components"
New-Item -ItemType Directory -Path "shared" -Force | Out-Null
Set-Location "shared"
@("Button.tsx", "Input.tsx", "Card.tsx", "Modal.tsx", "index.ts") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}
Set-Location ".."
New-Item -ItemType Directory -Path "layout" -Force | Out-Null
Set-Location "layout"
@("Header.tsx", "Sidebar.tsx", "MainLayout.tsx", "index.ts") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}
Set-Location "..\.."

# features
New-Item -ItemType Directory -Path "features" -Force | Out-Null
Set-Location "features"

$features = @("auth", "dashboard", "properties", "tenants", "payments", "expenses", "notifications", "caretakers", "admin")
foreach ($feat in $features) {
    New-Item -ItemType Directory -Path $feat -Force | Out-Null
    Set-Location $feat
    @("components", "types", "services", "store", "hooks", "pages") | ForEach-Object {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Set-Location $_
        # Create placeholder files in each subdir
        if ($_ -eq "components") {
            # Add some typical component names per feature
            switch ($feat) {
                "auth" { $compFiles = @("LoginForm.tsx", "RegisterForm.tsx") }
                "dashboard" { $compFiles = @("StatsWidget.tsx", "RecentActivity.tsx") }
                "properties" { $compFiles = @("PropertyCard.tsx", "PropertyForm.tsx", "PropertyList.tsx") }
                "tenants" { $compFiles = @("TenantCard.tsx", "TenantForm.tsx", "TenantList.tsx") }
                "payments" { $compFiles = @("PaymentRow.tsx", "PaymentForm.tsx", "ArrearsList.tsx") }
                "expenses" { $compFiles = @("ExpenseRow.tsx", "ExpenseForm.tsx") }
                "notifications" { $compFiles = @("NotificationBell.tsx", "NotificationList.tsx") }
                "caretakers" { $compFiles = @("CaretakerCard.tsx", "CaretakerForm.tsx") }
                "admin" { $compFiles = @("TenantManager.tsx", "UserList.tsx") }
                default { $compFiles = @("Placeholder.tsx") }
            }
            foreach ($f in $compFiles) { New-Item -ItemType File -Path $f -Force | Out-Null }
        }
        elseif ($_ -eq "types") {
            New-Item -ItemType File -Path "index.ts" -Force | Out-Null
        }
        elseif ($_ -eq "services") {
            $serviceFile = $feat -replace "ies$", "y"  # crude plural to singular
            $serviceFile = $serviceFile -replace "s$", ""  # remove trailing s
            New-Item -ItemType File -Path "$($serviceFile)Api.ts" -Force | Out-Null
        }
        elseif ($_ -eq "store") {
            New-Item -ItemType File -Path "$($feat)Slice.ts" -Force | Out-Null
        }
        elseif ($_ -eq "hooks") {
            $hookName = "use$($feat.Substring(0,1).ToUpper() + $feat.Substring(1))"
            New-Item -ItemType File -Path "$hookName.ts" -Force | Out-Null
        }
        elseif ($_ -eq "pages") {
            # Add page files per feature
            switch ($feat) {
                "auth" { $pageFiles = @("Login.tsx", "Register.tsx", "ForgotPassword.tsx") }
                "dashboard" { $pageFiles = @("Dashboard.tsx") }
                "properties" { $pageFiles = @("PropertyList.tsx", "PropertyDetail.tsx") }
                "tenants" { $pageFiles = @("TenantList.tsx", "TenantDetail.tsx") }
                "payments" { $pageFiles = @("PaymentList.tsx", "Arrears.tsx") }
                "expenses" { $pageFiles = @("ExpenseList.tsx", "ExpenseForm.tsx") }
                "notifications" { $pageFiles = @("Notifications.tsx") }
                "caretakers" { $pageFiles = @("CaretakerList.tsx", "CaretakerDetail.tsx") }
                "admin" { $pageFiles = @("AdminDashboard.tsx") }
                default { $pageFiles = @("Placeholder.tsx") }
            }
            foreach ($f in $pageFiles) { New-Item -ItemType File -Path $f -Force | Out-Null }
        }
        Set-Location ".."
    }
    Set-Location ".."
}
Set-Location ".." # back to src

# core
New-Item -ItemType Directory -Path "core" -Force | Out-Null
Set-Location "core"
$coreDirs = @("api", "constants", "i18n", "storage", "contexts", "hooks", "store", "utils")
foreach ($dir in $coreDirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Set-Location $dir
    # Create specific files per directory
    switch ($dir) {
        "api" {
            @("axios.ts", "endpoints.ts") | ForEach-Object { New-Item -ItemType File -Path $_ -Force | Out-Null }
        }
        "constants" {
            @("appConstants.ts", "routePaths.ts") | ForEach-Object { New-Item -ItemType File -Path $_ -Force | Out-Null }
        }
        "i18n" {
            @("i18n.ts", "locales.ts") | ForEach-Object { New-Item -ItemType File -Path $_ -Force | Out-Null }
        }
        "storage" {
            @("localStorage.ts", "sessionStorage.ts") | ForEach-Object { New-Item -ItemType File -Path $_ -Force | Out-Null }
        }
        "contexts" {
            @("ThemeContext.tsx", "ToastContext.tsx", "TenantContext.tsx") | ForEach-Object { New-Item -ItemType File -Path $_ -Force | Out-Null }
        }
        "hooks" {
            @("useMediaQuery.ts", "useDebounce.ts", "useLocalStorage.ts") | ForEach-Object { New-Item -ItemType File -Path $_ -Force | Out-Null }
        }
        "store" {
            @("store.ts", "rootReducer.ts") | ForEach-Object { New-Item -ItemType File -Path $_ -Force | Out-Null }
        }
        "utils" {
            @("logger.ts", "errorHandler.ts", "formatters.ts", "validators.ts") | ForEach-Object { New-Item -ItemType File -Path $_ -Force | Out-Null }
        }
    }
    Set-Location ".."
}
Set-Location ".." # back to src

# styles
New-Item -ItemType Directory -Path "styles" -Force | Out-Null
Set-Location "styles"
@("variables.css", "animations.css", "global.css", "theme.css", "components.css") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}
Set-Location ".."

# router
New-Item -ItemType Directory -Path "router" -Force | Out-Null
Set-Location "router"
@("AdminRoute.tsx", "PrivateRoute.tsx", "FeatureGate.tsx", "routes.tsx") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}
Set-Location ".."

# root src files
@("App.tsx", "main.tsx", "vite-env.d.ts") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}

Set-Location ".." # back to frontend

# frontend config files
@(
    ".env.example", ".env", ".eslintrc.js", ".prettierrc", "babel.config.js",
    "eslint.config.js", "jest.config.js", "jest.setup.js", "postcss.config.js",
    "tailwind.config.js", "tsconfig.json", "vite.config.ts", "package.json"
) | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}

Set-Location ".." # back to root

# -------------------- ROOT FILES --------------------
@("docker-compose.yml", "render.yaml", ".gitignore", "README.md") | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}

Write-Host "Project structure created successfully at $((Get-Location).Path)"