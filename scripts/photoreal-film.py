"""Composite a moving photographic SUV into an AI-generated Western Ghats plate.
This is a photoreal animated visual, NOT camera-shot footage. Both source assets
were generated for this design. Requires Pillow and imageio-ffmpeg.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import subprocess, imageio_ffmpeg, math
root=Path(__file__).resolve().parent.parent
source=Image.open(root/'public/media/western-ghats-cinematic.jpg').convert('RGBA')
plate=Image.open(root/'public/media/cinematic-road-plate.jpg').convert('RGBA').resize(source.size)
w,h=source.size
mask=Image.new('L',(w,h));d=ImageDraw.Draw(mask)
d.polygon([(864,558),(876,532),(891,520),(912,508),(946,498),(1009,512),(1027,527),(1035,546),(1051,551),(1061,568),(1063,587),(1055,612),(1043,630),(1027,630),(1006,644),(982,652),(961,644),(939,641),(930,655),(913,650),(905,639),(881,632),(865,619),(858,596)],fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(.7))
source.putalpha(mask)
car=source.crop((850,490,1072,663))
car.save(root/'.cache/car-cutout.png')
# Frames are streamed, never stored as a large tracked dataset.
ff=imageio_ffmpeg.get_ffmpeg_exe()
raw=root/'.cache/cinematic-raw.mp4'
p=subprocess.Popen([ff,'-y','-loglevel','error','-f','rawvideo','-vcodec','rawvideo','-s',f'{w}x{h}','-pix_fmt','rgb24','-r','24','-i','-','-an','-c:v','libx264','-crf','23','-preset','fast','-pix_fmt','yuv420p',str(raw)],stdin=subprocess.PIPE)
for i in range(384):
 t=i/383
 # A gently curving, perspective-correct journey up the visible road.
 x=960+278*t-29*t*t; y=578-120*t-20*t*t
 scale=1-.43*t
 moving=car.resize((round(car.width*scale),round(car.height*scale)),Image.Resampling.LANCZOS).rotate(22*t,resample=Image.Resampling.BICUBIC,expand=True)
 frame=plate.copy();frame.alpha_composite(moving,(round(x-moving.width/2),round(y-moving.height/2)))
 zoom=1.015+.025*t
 cw,ch=round(w/zoom),round(h/zoom);left=round((w-cw)*.62);top=round((h-ch)*.53)
 frame=frame.crop((left,top,left+cw,top+ch)).resize((w,h),Image.Resampling.LANCZOS).convert('RGB')
 p.stdin.write(frame.tobytes())
 if i==24:frame.save(root/'public/media/cinematic-poster.jpg',quality=93)
 if i%96==0:print(f'Cinematic frame {i}/384',flush=True)
p.stdin.close()
if p.wait()!=0:raise SystemExit('Frame encode failed')
subprocess.run([ff,'-y','-loglevel','error','-i',str(raw),'-filter_complex','[0:v]split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS,fps=24[main];[b]trim=end=1,setpts=PTS-STARTPTS,fps=24[head];[main][head]xfade=transition=fade:duration=1:offset=14,format=yuv420p[out]','-map','[out]','-an','-c:v','libx264','-crf','23','-preset','medium','-movflags','+faststart',str(root/'public/media/cinematic-drive.mp4')],check=True)
print('15-second photoreal animated loop complete.')
