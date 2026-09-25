import re

with open('app/dashboard/settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                {/* Yellow iBees Logo Box Preview */}
                <div className="h-28 bg-[#FFC800] rounded-2xl border border-amber-400 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                  <span className="font-serif italic font-black text-2xl text-slate-950 block leading-none">
                    iBees
                  </span>
                  <span className="text-[9px] font-bold text-slate-900 block leading-none mt-1">
                    we believe. we can.
                  </span>
                </div>'''

replacement = '''                {/* Logo Box Preview */}
                {settings.logoUrl ? (
                  <div className="h-28 rounded-2xl border border-slate-200 p-2 flex items-center justify-center shadow-2xs relative overflow-hidden bg-white">
                    <img src={settings.logoUrl} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="h-28 bg-[#FFC800] rounded-2xl border border-amber-400 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="font-serif italic font-black text-2xl text-slate-950 block leading-none">
                      iBees
                    </span>
                    <span className="text-[9px] font-bold text-slate-900 block leading-none mt-1">
                      we believe. we can.
                    </span>
                  </div>
                )}'''

# normalize line endings for comparison
content_crlf = content.replace('\r\n', '\n')
target_crlf = target.replace('\r\n', '\n')

new_content = content_crlf.replace(target_crlf, replacement)

with open('app/dashboard/settings/page.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(new_content)
