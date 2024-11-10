local callback = nil
local scoreTarget = 1000
function StartGame(data, cb)
    if not callback then
        callback = cb
        scoreTarget = data.scoreTarget
        local time = data.time
        SendNUIMessage({type="startgame", data={time=time, target=scoreTarget}})
        SetNuiFocus(true, true)
    end
end
exports('thermitematch3', StartGame)

RegisterNuiCallback('finishgame', function(data)
    SetNuiFocus(false, false)
    local score = tonumber(data.score)
    if callback then
        callback(score>=tonumber(scoreTarget))
        callback=nil
    end
    scoreTarget=1000
end)