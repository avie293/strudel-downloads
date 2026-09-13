import os
import sys
import threading
import urllib.request
import zipfile
import shutil
import ctypes
import tkinter as tk
from tkinter import filedialog
import customtkinter as ctk

try:
    ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("Strudel.WorldInstaller.App")
except:
    pass

REPO_OWNER = "UR_USERNAME" #<-- Change to your github username
REPO_NAME = "UR_REPO_NAME" #<-- Change to your repository name
REPO_BRANCH = "UR_REPO_BRANCH" #<-- Change to your repository branch

ctk.set_appearance_mode("Light")
ctk.set_default_color_theme("green")

class CustomMessageBox(ctk.CTkToplevel):
    def __init__(self, title, message, is_error=False):
        super().__init__()
        self.geometry("420x220")
        self.resizable(False, False)
        self.configure(fg_color="#ffb6c1")
        self.attributes("-topmost", True)
        self.update_idletasks()
        
        self.remove_native_titlebar()
        self.set_icon()

        self.bind("<Button-1>", self.start_move)
        self.bind("<B1-Motion>", self.do_move)
        
        card = ctk.CTkFrame(self, fg_color="#ffffff", corner_radius=18)
        card.pack(fill="both", expand=True, padx=15, pady=15)
        card.bind("<Button-1>", self.start_move)
        card.bind("<B1-Motion>", self.do_move)
        
        lbl_title = ctk.CTkLabel(card, text=title, font=ctk.CTkFont(size=18, weight="bold"), text_color="#ff4d4d" if is_error else "#2b2b2b")
        lbl_title.pack(pady=(20, 8))
        lbl_title.bind("<Button-1>", self.start_move)
        lbl_title.bind("<B1-Motion>", self.do_move)
        
        lbl_msg = ctk.CTkLabel(card, text=message, font=ctk.CTkFont(size=12), text_color="#555555", wraplength=360, justify="center")
        lbl_msg.pack(pady=(0, 20), padx=20)
        lbl_msg.bind("<Button-1>", self.start_move)
        lbl_msg.bind("<B1-Motion>", self.do_move)
        
        btn_ok = ctk.CTkButton(
            card, text="OK", width=120, height=36,
            fg_color="#ff69b4", hover_color="#ff1493",
            font=ctk.CTkFont(size=13, weight="bold"), corner_radius=18,
            command=self.destroy
        )
        btn_ok.pack(pady=(0, 20))

    def set_icon(self):
        try:
            base_path = sys._MEIPASS if hasattr(sys, "_MEIPASS") else os.path.abspath(".")
            icon_path = os.path.join(base_path, "icon.ico")
            if os.path.exists(icon_path):
                self.iconbitmap(icon_path)
        except:
            pass

    def remove_native_titlebar(self):
        try:
            GWL_STYLE = -16
            WS_CAPTION = 0x00C00000
            WS_THICKFRAME = 0x00040000
            hwnd = ctypes.windll.user32.GetParent(self.winfo_id())
            if hwnd == 0:
                hwnd = self.winfo_id()
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_STYLE)
            style = style & ~WS_CAPTION & ~WS_THICKFRAME
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_STYLE, style)
        except:
            pass

    def start_move(self, event):
        self.x = event.x
        self.y = event.y

    def do_move(self, event):
        deltax = event.x - self.x
        deltay = event.y - self.y
        x = self.winfo_x() + deltax
        y = self.winfo_y() + deltay
        self.geometry(f"+{x}+{y}")

class StrudelWorldInstaller(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Strudel World Installer")
        self.geometry("620x450")
        self.resizable(False, False)
        self.configure(fg_color="#ffb6c1")

        self.set_app_icon()

        self.after(100, self.remove_native_titlebar)

        self.title_bar = ctk.CTkFrame(self, fg_color="#ffb6c1", corner_radius=0, height=38)
        self.title_bar.pack(fill="x", padx=0, pady=0)
        self.title_bar.pack_propagate(False)

        self.title_bar.bind("<Button-1>", self.start_move)
        self.title_bar.bind("<B1-Motion>", self.do_move)

        self.title_text = ctk.CTkLabel(
            self.title_bar, 
            text="Strudel World Installer", 
            font=ctk.CTkFont(size=12, weight="bold"), 
            text_color="#ffffff"
        )
        self.title_text.pack(side="left", padx=(15, 5))
        self.title_text.bind("<Button-1>", self.start_move)
        self.title_text.bind("<B1-Motion>", self.do_move)

        self.btn_close = ctk.CTkButton(
            self.title_bar, text="✕", width=38, height=32,
            fg_color="transparent", hover_color="#ff4d4d",
            text_color="#ffffff", font=ctk.CTkFont(size=12, weight="bold"),
            command=self.destroy
        )
        self.btn_close.pack(side="right", padx=2)

        self.btn_min = ctk.CTkButton(
            self.title_bar, text="🗕", width=38, height=32,
            fg_color="transparent", hover_color="#ff8da1",
            text_color="#ffffff", font=ctk.CTkFont(size=10, weight="bold"),
            command=self.iconify
        )
        self.btn_min.pack(side="right", padx=0)

        self.main_card = ctk.CTkFrame(self, fg_color="#ffffff", corner_radius=20)
        self.main_card.pack(fill="both", expand=True, padx=20, pady=(5, 20))

        self.heading_label = ctk.CTkLabel(
            self.main_card, 
            text="UR_WORLD_NAME", #<-- Change to your world name
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color="#2b2b2b"
        )
        self.heading_label.pack(pady=(22, 4))

        self.subtitle_label = ctk.CTkLabel(
            self.main_card, 
            text="Install in your minecraft saves folder.", 
            font=ctk.CTkFont(size=13), 
            text_color="#888888"
        )
        self.subtitle_label.pack(pady=(0, 18))

        self.form_container = ctk.CTkFrame(self.main_card, fg_color="#f9f9f9", corner_radius=16)
        self.form_container.pack(fill="x", padx=25, pady=8)
        
        self.form_container.grid_columnconfigure(1, weight=1)

        self.lbl_world = ctk.CTkLabel(
            self.form_container, text="Worldname:", 
            font=ctk.CTkFont(size=13, weight="bold"), text_color="#555555", anchor="w"
        )
        self.lbl_world.grid(row=0, column=0, padx=(20, 10), pady=16, sticky="w")

        self.entry_world = ctk.CTkEntry(
            self.form_container, height=38, 
            fg_color="#ffffff", border_color="#ff69b4", text_color="#333333", font=ctk.CTkFont(size=12)
        )
        self.entry_world.insert(0, "DEFAULT_WORLD_NAME") #<-- Change to your DEFAULT world name
        self.entry_world.grid(row=0, column=1, columnspan=2, padx=(0, 20), pady=16, sticky="ew")

        self.lbl_path = ctk.CTkLabel(
            self.form_container, text="Folderpath (saves):", 
            font=ctk.CTkFont(size=13, weight="bold"), text_color="#555555", anchor="w"
        )
        self.lbl_path.grid(row=1, column=0, padx=(20, 10), pady=(0, 16), sticky="w")

        self.entry_path = ctk.CTkEntry(
            self.form_container, height=38, 
            fg_color="#ffffff", border_color="#ff69b4", text_color="#333333", font=ctk.CTkFont(size=11)
        )
        default_saves = self.get_default_saves_path()
        self.entry_path.insert(0, default_saves)
        self.entry_path.grid(row=1, column=1, padx=(0, 6), pady=(0, 16), sticky="ew")

        self.btn_browse = ctk.CTkButton(
            self.form_container, text="...", width=42, height=38, 
            fg_color="#ff69b4", hover_color="#ff1493", 
            font=ctk.CTkFont(size=14, weight="bold"),
            command=self.browse_folder
        )
        self.btn_browse.grid(row=1, column=2, padx=(0, 20), pady=(0, 16), sticky="e")

        self.status_label = ctk.CTkLabel(self.main_card, text="Download/Install Ready", font=ctk.CTkFont(size=13, weight="bold"), text_color="#666666")
        self.status_label.pack(pady=(12, 6))

        self.progress_bar = ctk.CTkProgressBar(self.main_card, width=480, height=18, progress_color="#ff69b4", fg_color="#e5e5e5")
        self.progress_bar.set(0)
        self.progress_bar.pack(pady=(0, 18))

        self.btn_install = ctk.CTkButton(
            self.main_card, 
            text="Install", 
            font=ctk.CTkFont(size=15, weight="bold"), 
            height=46, width=260, 
            fg_color="#ff69b4", hover_color="#ff1493", corner_radius=22,
            command=self.start_installation_thread
        )
        self.btn_install.pack(pady=(0, 20))

    def set_app_icon(self):
        try:
            base_path = sys._MEIPASS if hasattr(sys, "_MEIPASS") else os.path.abspath(".")
            icon_path = os.path.join(base_path, "icon.ico")
            if os.path.exists(icon_path):
                self.iconbitmap(icon_path)
        except Exception as e:
            print("Icon Fehler:", e)

    def remove_native_titlebar(self):
        try:
            GWL_STYLE = -16
            WS_CAPTION = 0x00C00000
            WS_THICKFRAME = 0x00040000
            hwnd = ctypes.windll.user32.GetParent(self.winfo_id())
            if hwnd == 0:
                hwnd = self.winfo_id()
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_STYLE)
            style = style & ~WS_CAPTION & ~WS_THICKFRAME
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_STYLE, style)
            
            ctypes.windll.user32.SetWindowTextW(hwnd, "Strudel World Installer")
            self.geometry(f"{self.winfo_width()}x{self.winfo_height()}")
        except:
            pass

    def start_move(self, event):
        self.x = event.x
        self.y = event.y

    def do_move(self, event):
        deltax = event.x - self.x
        deltay = event.y - self.y
        x = self.winfo_x() + deltax
        y = self.winfo_y() + deltay
        self.geometry(f"+{x}+{y}")

    def get_default_saves_path(self):
        appdata = os.getenv('APPDATA')
        if appdata:
            return os.path.join(appdata, '.minecraft', 'saves')
        return os.path.expanduser('~')

    def browse_folder(self):
        dir_path = filedialog.askdirectory(initialdir=self.entry_path.get())
        if dir_path:
            self.entry_path.delete(0, "end")
            self.entry_path.insert(0, dir_path)

    def start_installation_thread(self):
        self.btn_install.configure(state="disabled")
        self.btn_browse.configure(state="disabled")
        threading.Thread(target=self.run_installation, daemon=True).start()

    def update_status(self, text):
        self.status_label.configure(text=text)
        self.update_idletasks()

    def run_installation(self):
        zip_path = None
        extract_temp_dir = None
        try:
            world_name = self.entry_world.get().strip()
            base_saves = self.entry_path.get().strip()

            if not world_name or not base_saves:
                raise Exception("Bitte fülle alle Felder aus!")

            target_world_dir = os.path.join(base_saves, world_name)
            
            zip_url = f"https://github.com/{REPO_OWNER}/{REPO_NAME}/archive/refs/heads/{REPO_BRANCH}.zip"
            zip_path = os.path.join(base_saves, "temp_world_download.zip")
            extract_temp_dir = os.path.join(base_saves, "temp_extracted_world")

            self.progress_bar.set(0.2)
            self.update_status("download_world...")

            urllib.request.urlretrieve(zip_url, zip_path)

            self.progress_bar.set(0.6)
            self.update_status("unpack_files...")

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_temp_dir)

            extracted_subdirs = os.listdir(extract_temp_dir)
            if not extracted_subdirs:
                raise Exception("archiv_empty!")
            
            actual_content_dir = os.path.join(extract_temp_dir, extracted_subdirs[0])

            if os.path.exists(target_world_dir):
                shutil.rmtree(target_world_dir)
            os.makedirs(target_world_dir, exist_ok=True)

            self.progress_bar.set(0.8)
            self.update_status("copy_filesмана...")

            for item_name in os.listdir(actual_content_dir):
                s = os.path.join(actual_content_dir, item_name)
                d = os.path.join(target_world_dir, item_name)
                if os.path.isdir(s):
                    shutil.copytree(s, d)
                else:
                    shutil.copy2(s, d)

            self.progress_bar.set(1.0)
            self.update_status("World Installed")
            self.after(0, lambda: CustomMessageBox("Installed", f"World installed under:\n{target_world_dir}"))

        except Exception as e:
            self.progress_bar.set(0)
            self.update_status("ERROR_001_install_failed")
            self.after(0, lambda: CustomMessageBox("ERROR", f"install_faild:\n{str(e)}", is_error=True))

        finally:
            if zip_path and os.path.exists(zip_path):
                try: os.remove(zip_path)
                except: pass
            if extract_temp_dir and os.path.exists(extract_temp_dir):
                try: shutil.rmtree(extract_temp_dir)
                except: pass

            self.btn_install.configure(state="normal")
            self.btn_browse.configure(state="normal")

if __name__ == "__main__":
    app = StrudelWorldInstaller()
    app.mainloop()
