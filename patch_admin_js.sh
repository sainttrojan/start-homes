#!/bin/bash
awk '
BEGIN { skip = 0 }
/const urlInput = document.getElementById/ {
    skip = 1
    print "    const configInput = document.getElementById('\''firebase-config-input'\'');"
    print "    const saveBtn = document.getElementById('\''firebase-save-btn'\'');"
    print ""
    print "    if (configInput) {"
    print "      const cfg = FirebaseConfig.getConfig();"
    print "      if(cfg) configInput.value = JSON.stringify(cfg, null, 2);"
    print "    }"
    print ""
    print "    if (saveBtn) {"
    print "      saveBtn.addEventListener('\''click'\'', async () => {"
    print "        try {"
    print "          FirebaseConfig.saveConfig(configInput.value);"
    print "          FirebaseConfig.initApp();"
    print "          this.checkConnectionStatus();"
    print "          await this.refreshData();"
    print "          showToast('\''تم حفظ إعدادات Firebase بنجاح!'\'', '\''success'\'');"
    print "        } catch(e) {"
    print "          showToast(e.message, '\''error'\'');"
    print "        }"
    print "      });"
    print "    }"
}
/if \(copySqlBtn\)/ {
    if (skip == 1) {
        skip = 0
    }
}
{
    if (skip == 0 && $0 !~ /const copySqlBtn = document.getElementById/) {
        print $0
    }
}
' js/admin.js > js/admin_fixed.js
mv js/admin_fixed.js js/admin.js
